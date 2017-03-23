dir_signin_widget=~/okta/okta-signin-widget
dir_okta_core=~/okta/okta-core
dir_loginpage=$(dir_okta_core)/clients/loginpage

local-deploy:
	cd $(dir_signin_widget) && npm run build:release 
	cd $(dir_okta_core) && ant deploy.modified.ui.loginpage -q

link:
	cd $(dir_signin_widget) && npm link
	cd $(dir_loginpage) && npm link @okta/okta-signin-widget
  

