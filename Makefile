APP_NAME := meta-photo
IMAGE_NAME := meta-photo
CONTAINER_NAME := meta-photo
PORT := 3000

.PHONY: build run stop remove

build:
	docker build --build-arg JSON_PLACEHOLDER_URL="https://jsonplaceholder.typicode.com" -t $(IMAGE_NAME) .

stop:
	@docker stop $(CONTAINER_NAME) || true

remove: stop
	@docker rm $(CONTAINER_NAME) || true

run: build remove
	docker run -d --name $(CONTAINER_NAME) -p $(PORT):$(PORT) $(IMAGE_NAME)