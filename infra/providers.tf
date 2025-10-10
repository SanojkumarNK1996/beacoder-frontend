terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket  = "beacoder-terraform"                  # Create this bucket manually once
    key     = "beacoder-frontend/terraform.tfstate" # Path inside the bucket
    region  = "us-east-1"
    encrypt = true
  }

  required_version = ">= 1.5.0"
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "beacoder-frontend"
      Environment = var.environment
      Owner       = "sanojkumar"
    }
  }
}
