# --- S3 bucket for hosting React app ---
resource "aws_s3_bucket" "react_app" {
  bucket_prefix = "my-react-app-"
}

resource "aws_s3_bucket_public_access_block" "public_access" {
  bucket                  = aws_s3_bucket.react_app.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

data "aws_iam_policy_document" "s3_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.react_app.arn}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.react_cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "react_policy" {
  bucket = aws_s3_bucket.react_app.id
  policy = data.aws_iam_policy_document.s3_policy.json
}