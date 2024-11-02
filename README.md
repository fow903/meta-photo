# Photos API Controller Documentation

This documentation provides details on the `PhotosController` used for handling requests to manage photo resources in the NestJS application.

## Tools and Dependencies List

1. **NestJS** (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/cli`, `@nestjs/config`, `@nestjs/testing`)
2. **Axios** (`axios`, `@nestjs/axios`)
3. **Swagger** (`@nestjs/swagger`, `swagger-ui-express`)
4. **TypeScript** (`typescript`, `ts-node`, `tsconfig-paths`)
5. **Linting and Formatting** (`eslint`, `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `prettier`, `eslint-config-prettier`, `eslint-plugin-prettier`)
6. **Testing Tools** (`jest`, `ts-jest`, `@types/jest`, `supertest`, `@types/supertest`)
7. **Node and Express** (`express`, `@types/express`)
8. **Utility Libraries** (`reflect-metadata`, `node-cache`, `source-map-support`)
9. **Scripts** (`build`, `start`, `start:dev`, `start:debug`, `start:prod`, `test`, `lint`, `format`)

## Project Setup

### Prerequisites
- **Yarn**: This project uses Yarn as the package manager.
- **Node.js**: Minimum version required is `18.19`.

### Installation
1. Clone the repository:
   ```sh
   git clone <repository-url>
   cd <repository-directory>
   ```

2. Install dependencies using Yarn:
   ```sh
   yarn install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of your project and add the following:
   ```env
   JSON_PLACEHOLDER_URL=https://jsonplaceholder.typicode.com
   ```

### Running the Application
To start the application, use the following command:
```sh
yarn start
```

## Endpoints

### 1. Get Photo by ID

**Endpoint:** `/externalapi/photos/:id`

**Method:** `GET`

**Description:** Fetch a specific photo by its unique ID.

**Parameters:**
- `id` (string): The unique identifier of the photo.

**Response:** Returns the enriched details of the requested photo.

**Example Request:**
```sh
GET /externalapi/photos/123
```

**Example Response:**
```json
{
  "id": "123",
  "title": "Sunset",
  "url": "https://example.com/photo123.jpg",
  "album": {
    "title": "Vacation",
    "user": {
      "email": "user@example.com"
    }
  }
}
```

### 2. Get Photos with Filters

**Endpoint:** `/externalapi/photos`

**Method:** `GET`

**Description:** Fetch a list of photos with optional filters and pagination.

**Query Parameters:**
- `title` (string, optional): Filter photos by title.
- `album.title` (string, optional): Filter photos by album title.
- `album.user.email` (string, optional): Filter photos by the album's user email.
- `limit` (number, optional, default: `25`): Number of photos to retrieve.
- `offset` (number, optional, default: `0`): Number of photos to skip before starting to return results.

**Response:** Returns a list of photos matching the given filters and pagination options.

**Example Request:**
```sh
GET /externalapi/photos?title=Sunset&album.title=Vacation&limit=10&offset=5
```

**Example Response:**
```json
[
  {
    "id": "123",
    "title": "Sunset",
    "url": "https://example.com/photo123.jpg",
    "album": {
      "title": "Vacation",
      "user": {
        "email": "user@example.com"
      }
    }
  },
  ...
]
```

### Swagger Documentation

**Endpoint:** `/api`

**Description:** Access Swagger UI to view all available API requests and their documentation.

## Notes
- The `PhotosController` relies on the `PhotosService` to perform data retrieval and enrichment.
- `PhotoFilters` are used to specify filter criteria, allowing users to filter the list of photos by attributes such as `title`, `albumTitle`, or `email`.
- Pagination can be controlled using the `limit` and `offset` query parameters to retrieve a subset of records.

# Makefile Commands Documentation

This project includes a Makefile to streamline common Docker operations, such as building, running, stopping, and removing Docker containers. Below, you will find the documentation for each command provided by the Makefile.

## Commands Overview

### 1. `build`
Builds the Docker image for the application using the provided build arguments.

- **Usage**: `make build`
- **Details**:
  - Builds a Docker image named as defined by the `IMAGE_NAME` variable.
  - Includes an argument `JSON_PLACEHOLDER_URL` used during the build process to specify the URL for JSON data.
- **Docker Command Used**:
  ```sh
  docker build --build-arg JSON_PLACEHOLDER_URL="https://jsonplaceholder.typicode.com" -t $(IMAGE_NAME) .
  ```

### 2. `stop`
Stops the currently running container.

- **Usage**: `make stop`
- **Details**:
  - Attempts to stop the container defined by `CONTAINER_NAME`.
  - If the container is not running, the command continues without error.
- **Docker Command Used**:
  ```sh
  docker stop $(CONTAINER_NAME) || true
  ```

### 3. `remove`
Removes the stopped container.

- **Usage**: `make remove`
- **Details**:
  - First calls `stop` to ensure the container is not running.
  - Removes the container defined by `CONTAINER_NAME`.
  - If the container does not exist, the command continues without error.
- **Docker Command Used**:
  ```sh
  docker rm $(CONTAINER_NAME) || true
  ```

### 4. `run`
Builds the Docker image, removes any existing container, and then runs the container.

- **Usage**: `make run`
- **Details**:
  - Calls `build` to build the Docker image.
  - Calls `remove` to ensure no existing container is running.
  - Runs a new container in detached mode (`-d`), mapping the port defined by `PORT`.
- **Docker Command Used**:
  ```sh
  docker run -d --name $(CONTAINER_NAME) -p $(PORT):$(PORT) $(IMAGE_NAME)
  ```

## Variables

- **`APP_NAME`**: The name of the application (used for reference).
- **`IMAGE_NAME`**: The name/tag of the Docker image that will be created.
- **`CONTAINER_NAME`**: The name of the Docker container.
- **`PORT`**: The port number used for running the application.

## Usage
To run any of these commands, simply use `make` followed by the command name:

```sh
make build   # Builds the Docker image
make run     # Builds, removes old container (if any), and runs the Docker container
make stop    # Stops the running Docker container
make remove  # Removes the Docker container
```

