# Serverless QR Code Generator

This project is a simple, modern web app that generates QR codes for any URL using a serverless backend powered by AWS Lambda and S3. The backend is implemented in Python and the frontend is a static HTML/CSS/JS site.

## Features
- **Generate QR codes for any URL**
- **Serverless backend**: No server to manage, runs on AWS Lambda
- **QR codes are stored and served from S3**
- **Clean, responsive frontend**

---

## How It Works

### Frontend
- The frontend (`index.html`, `style.css`, `script.js`) is a static web page.
- Users enter a URL and click "Generate QR Code".
- The page sends a POST request to the AWS Lambda function's public URL.
- When the Lambda responds with a QR code image URL, the page displays the QR code.

### Backend (AWS Lambda)
- The backend is implemented in [`lambda_function/lambda_function.py`](lambda_function/lambda_function.py).
- It receives a POST request with a JSON body containing a `url` field.
- It generates a QR code image for the URL using the `qrcode` and `Pillow` (PIL) libraries.
- The image is uploaded to an S3 bucket (`qr-code-generator22`) with public read access.
- The Lambda returns a JSON response with the public S3 URL of the QR code image.

#### Example Lambda Handler
```python
# lambda_function.py (excerpt)
def lambda_handler(event, context):
    body = json.loads(event['body'])
    url = body['url']
    img = qrcode.make(url)
    img_bytes = io.BytesIO()
    img.save(img_bytes)
    img_bytes = img_bytes.getvalue()
    filename = url.split('://')[1].replace('/', '_') + '.png'
    s3.put_object(Bucket='qr-code-generator22', Key=filename, Body=img_bytes, ContentType='image/png', ACL='public-read')
    location = s3.get_bucket_location(Bucket='qr-code-generator22')['LocationConstraint']
    region = '' if location is None else f'{location}'
    qr_code_url = f"https://s3-{region}.amazonaws.com/qr-code-generator22/{filename}"
    return {
        'statusCode': 200,
        'body': json.dumps({'message': 'QR code generated and uploaded to S3 bucket successfully!', 'qr_code_url': qr_code_url})
    }
```

---

## Packaging Lambda with Dependencies
- The Lambda function uses `qrcode` and `Pillow` (PIL) for QR code generation and image handling.
- These dependencies are included in the `lambda_function/` directory (vendored) so the Lambda can run without internet access or extra setup.
- To update dependencies, use pip to install them into the `lambda_function/` directory:
  ```sh
  pip install qrcode Pillow -t lambda_function/
  ```

---

## Deployment

### 1. Deploy the Lambda Function
- Zip the contents of the `lambda_function/` directory (not the directory itself):
  ```sh
  cd lambda_function
  zip -r ../lambda_function.zip .
  ```
- Upload `lambda_function.zip` to AWS Lambda (console or CLI).
- Set the handler to `lambda_function.lambda_handler`.
- Make sure the Lambda has permissions to write to your S3 bucket (`qr-code-generator22`).

### 2. Set Up the S3 Bucket
- Create an S3 bucket named `qr-code-generator22` (or update the code to use your bucket name).
- Set the bucket policy to allow public read access for the QR code images.

### 3. Configure API Gateway or Lambda URL
- Expose your Lambda function via API Gateway or Lambda Function URL.
- Update the `lambdaUrl` in `script.js` to match your endpoint.

### 4. Deploy the Frontend
- Host the static files (`index.html`, `style.css`, `script.js`) on any static web host (S3, Netlify, Vercel, GitHub Pages, etc).

---

## Usage
1. Open the web app in your browser.
2. Enter a URL and click "Generate QR Code".
3. The QR code image will appear, and you can download or share it.

---

## License
MIT License
