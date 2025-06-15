.PHONY: build run

# Build the Docker container
build:
	docker build -t vocabex .

# Run the Docker container with environment variables
run:
	docker run -p 8081:8080 \
		--env-file .env \
		vocabex