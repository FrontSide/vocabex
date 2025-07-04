.PHONY: build run

# Build the Docker container
build:
	docker build -t vocabex-local .

# Run the Docker container with environment variables
run:
	docker run -p 8081:3000 \
		--name vocabex \
		--network uptime-bridge \
		-d \
		--restart always \
		-v vocabex-db:/app/db \
		--env-file .env \
		vocabex-local