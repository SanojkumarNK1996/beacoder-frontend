data "aws_secretsmanager_secret_version" "react_env" {
  secret_id = var.secret_name
}
