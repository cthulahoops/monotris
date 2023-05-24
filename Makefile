deploy:
	rsync --delete -avz build/ aracari:/volumes/www/cthulahoops/monotris/
