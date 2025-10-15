import json
import boto3
import qrcode
import io

# Initialize a session using Amazon S3
s3 = boto3.client('s3')

def lambda_handler(event, context):
    # Handle preflight OPTIONS request
    http_method = event.get('requestContext', {}).get('http', {}).get('method')
    if http_method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': ''
        }
    
    # Support both direct and API Gateway invocation
    if 'body' in event:
        body = json.loads(event['body'])
    else:
        body = event  # direct test or SDK call
    
    url = body['url']
    
    # Generate QR code
    img = qrcode.make(url)
    img_bytes = io.BytesIO()
    img.save(img_bytes)
    img_bytes = img_bytes.getvalue()
    
    # Generate a unique filename
    filename = url.split("://")[1].replace("/", "_") + '.png'
    
    # Upload the QR code to the S3 bucket
    s3.put_object(
        Bucket='qr-code-generator-python21', 
        Key=filename, 
        Body=img_bytes, 
        ContentType='image/png', 
        ACL='public-read'
    )
    
    # Generate the URL of the uploaded QR code
    location = s3.get_bucket_location(Bucket='qr-code-generator-python21')['LocationConstraint']
    region = '' if location is None else f'{location}'
    qr_code_url = f"https://qr-code-generator-python21.s3.amazonaws.com/{filename}"
    
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps({
            'message': 'QR code generated and uploaded to S3 bucket successfully!', 
            'qr_code_url': qr_code_url
        })
    }
