# --- Local build and deploy ---
resource "null_resource" "build_and_deploy" {
  # Triggers ensure this runs every time
  triggers = {
    repo_url       = var.github_repo
    s3_bucket_name = aws_s3_bucket.react_app.bucket
    cloudfront_id  = aws_cloudfront_distribution.react_cdn.id
    secret_version = data.aws_secretsmanager_secret_version.react_env.version_id
    always_run     = timestamp()
  }

  # Ensure infra is ready first
  depends_on = [
    aws_s3_bucket.react_app,
    aws_cloudfront_distribution.react_cdn
  ]

  provisioner "local-exec" {
    command = <<EOT
      set -e

      # Temp directory
      TMP_DIR="/tmp/react-app"
      rm -rf $TMP_DIR
      mkdir -p $TMP_DIR

      echo "📦 Cloning repository..."
      git clone ${var.github_repo} $TMP_DIR

      cd $TMP_DIR/source

      echo "🔐 Fetching secrets from AWS Secrets Manager..."
      SECRET_JSON=$(aws secretsmanager get-secret-value \
        --secret-id ${var.secret_name} \
        --query SecretString \
        --output text)

      echo "🧩 Converting secrets to .env file..."
      python3 -c "
import json
import sys

json_str = '''$SECRET_JSON'''

try:
    # Strip any leading/trailing whitespace
    json_str = json_str.strip()
    data = json.loads(json_str)
    
    for key, value in data.items():
        print(f'{key}={value}')
except json.JSONDecodeError as e:
    print(f'JSON Decode Error: {e}', file=sys.stderr)
    print(f'Received data: {repr(json_str[:200])}', file=sys.stderr)
    sys.exit(1)
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
" > "$TMP_DIR/source/.env"

      echo "✅ Files in source directory:"
      # Print .env content
        if [ -f "$TMP_DIR/source/.env" ]; then
        echo "Contents of .env:"
        cat $TMP_DIR/source/.env
        else
        echo ".env file does not exist yet."
        fi

      echo "📦⚙️ Installing dependencies..."
      npm install
      npm run build

      echo "☁️  Uploading build to S3..."
      aws s3 sync dist/ s3://${aws_s3_bucket.react_app.bucket} --delete

      echo "🚀 Invalidating CloudFront cache..."
      aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.react_cdn.id} --paths "/*"

      echo "🎉 Deployment complete!"
    EOT

    interpreter = ["/bin/bash", "-c"]
  }
}


output "cloudfront_url" {
  value = aws_cloudfront_distribution.react_cdn.domain_name
}