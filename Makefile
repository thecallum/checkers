dev:
	docker-compose build && \
	docker-compose up

prod:
	docker-compose -f docker-compose.production.yml build && \
	docker-compose -f docker-compose.production.yml up --detach