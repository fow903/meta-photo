# Photos API Controller Documentation

This documentation provides details on the `PhotosController` used for handling requests to manage photo resources in the NestJS application.

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
   JSON_PLACEHOLDER=https://jsonplaceholder.typicode.com
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

It seems there was an issue while trying to update the documentation. Let me add the Swagger endpoint information directly here:

---

### Swagger Documentation

**Endpoint:** `/api`

**Description:** Access Swagger UI to view all available API requests and their documentation.

## Notes
- The `PhotosController` relies on the `PhotosService` to perform data retrieval and enrichment.
- `PhotoFilters` are used to specify filter criteria, allowing users to filter the list of photos by attributes such as `title`, `albumTitle`, or `email`.
- Pagination can be controlled using the `limit` and `offset` query parameters to retrieve a subset of records.

