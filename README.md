# Wordpress boilerplate with Docker and html5blank

* html5blank: [github.com/html5blank/html5blank](https://github.com/html5blank/html5blank)
* docker: [docs.docker.com/compose/wordpress/](https://docs.docker.com/compose/wordpress/)

## Setup

* Run `docker-compose up`. Go to `http://localhost:8000/` to install Wordpress
* Upgrade wordpress and all plugins if necessary
* Run `npm` install in the html5blank directory
* In the same directory run `gulp`
* For production run `gulp build`. If you've previously done this, make sure to remove the "dist" folder first. To continue development locally, make sure to run `gulp` again or you'll receive 404 errors for scripts and stylesheets on the "src" build.

## Known limitations

* Can only upload files 2 MB or smaller