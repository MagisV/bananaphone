from flask import Flask, render_template, request, flash, jsonify
import numpy as np
import os
import torch
from transformers import AutoTokenizer, AutoModel
import psutil  # For measuring RAM usage

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'default_secret_key')  # Required for flashing messages
offline = False

def get_ram_usage():
    process = psutil.Process(os.getpid())
    ram_usage = process.memory_info().rss / (1024 * 1024)  # Convert bytes to MB
    return ram_usage

# Specify the model name
model_name = "intfloat/multilingual-e5-small"

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModel.from_pretrained(model_name)

model = model.eval()  # Set to evaluation mode
model = model.to('cpu')

print(f"RAM usage after loading model: {get_ram_usage():.2f} MB")

def query_local(text):
    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs)
    # Obtain the embeddings (mean pooling)
    embeddings = outputs.last_hidden_state.mean(dim=1)
    # Convert to numpy array
    ram_usage = get_ram_usage()
    print(f"RAM usage after processing '{text}': {ram_usage:.2f} MB")
    return embeddings[0].numpy()


# File paths for vectors
banana_file = 'banana_vector.npy'
phone_file = 'phone_vector.npy'

def load_or_fetch_vector(filename, word):
    if os.path.exists(filename):
        return np.load(filename)
    else:
        vector = query_local(word)
        if vector is not None:
            print(f"Saving vector to {filename}")
            np.save(filename, np.array(vector))
            return np.array(vector)
        else:
            return None

# Load or fetch banana and phone vectors on startup
banana = load_or_fetch_vector(banana_file, "banana")
phone = load_or_fetch_vector(phone_file, "phone")

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

def get_similarity_to_phone_and_banana(word_vector):
    similarity_to_banana = cosine_similarity(word_vector, banana)
    similarity_to_phone = cosine_similarity(word_vector, phone)
    return similarity_to_banana, similarity_to_phone

def how_much_is_it_like_phone_and_banana_softmax(word_vector, temperature=0.025):
    similarity_to_banana, similarity_to_phone = get_similarity_to_phone_and_banana(word_vector)

    # Apply softmax to the similarities
    exp_banana = np.exp(similarity_to_banana / temperature)
    exp_phone = np.exp(similarity_to_phone / temperature)
    
    softmax_banana = exp_banana / (exp_banana + exp_phone)
    softmax_phone = exp_phone / (exp_banana + exp_phone)
    
    # Convert to percentages
    return round(softmax_banana * 100), round(softmax_phone * 100)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/calculate', methods=['POST'])
def calculate_similarity():
    word = request.form['word']
    word = word.lower().strip()
    if not offline:
        word_vector = query_local(word)
    else:
        word_vector = np.random.rand(8)  # Random vector for offline testing
    if word_vector is None:
        return jsonify({'error': 'Error processing request'}), 500
    else:
        banana_percentage, phone_percentage = how_much_is_it_like_phone_and_banana_softmax(np.array(word_vector))
        similarity_results = {
            'banana': banana_percentage,
            'phone': phone_percentage
        }
        return jsonify(similarity_results)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
