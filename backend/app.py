import torch
import base64
import io
import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS
from colorizers import eccv16, siggraph17, preprocess_img, postprocess_tens

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the colorization models
colorizer_eccv16 = eccv16(pretrained=True).eval()
colorizer_siggraph17 = siggraph17(pretrained=True).eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def colorize_image(image_data, use_gpu=False):
    try:
        img = Image.open(image_data).convert("RGB")
        img = np.array(img)

        (tens_l_orig, tens_l_rs) = preprocess_img(img, HW=(256,256))

        if use_gpu:
            colorizer_eccv16.to(device)
            colorizer_siggraph17.to(device)
            tens_l_rs = tens_l_rs.to(device)

        out_img_eccv16 = postprocess_tens(tens_l_orig, colorizer_eccv16(tens_l_rs).cpu())
        out_img_siggraph17 = postprocess_tens(tens_l_orig, colorizer_siggraph17(tens_l_rs).cpu())

        return out_img_eccv16, out_img_siggraph17
    except Exception as e:
        print(f"Error in colorize_image: {e}")
        raise

def image_to_base64(img):
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
    return img_str

@app.route('/colorize', methods=['POST'])
def colorize():
    try:
        image_file = request.files['image']
        use_gpu = request.form.get('use_gpu', False) == 'true'

        out_img_eccv16, out_img_siggraph17 = colorize_image(image_file, use_gpu)

        out_img_eccv16 = Image.fromarray((out_img_eccv16 * 255).astype('uint8'))
        out_img_siggraph17 = Image.fromarray((out_img_siggraph17 * 255).astype('uint8'))

        eccv16_base64 = image_to_base64(out_img_eccv16)
        siggraph17_base64 = image_to_base64(out_img_siggraph17)

        return jsonify({
            'eccv16': eccv16_base64,
            'siggraph17': siggraph17_base64,
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
