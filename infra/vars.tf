#-------------------------------------------
# Required variables (do not add defaults here!)
#-------------------------------------------

#-------------------------------------------
# Configurable variables
#-------------------------------------------
variable "region" {
  default = "us-west-2"
}

variable "domain_name" {
  default = "APP_NAME.kye.dev"
}

variable "zone_name" {
  default = "kye.dev"
}

variable "deno_deploy_acme" {
  default = "84e3160caf2e7082aeb72eb8._acme.deno.dev."
}
