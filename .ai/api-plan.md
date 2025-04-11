# REST API Plan

## 1. Resources

1. **Users** (based on the `users` table)
   - Fields: `id`, `email`, `role`, `hashed_password`, `created_at`, `updated_at`

2. **Quotations** (from the `quotations` table)
   - Fields: `id`, `user_id`, `estimation_type`, `scope`, `man_days`, `buffer`, `dynamic_attributes`, `created_at`, `updated_at`

3. **Platforms** (from the `platforms` table)
   - Fields: `id`, `name`

4. **Quotation-Platforms** (junction table `quotation_platforms`)
   - Represents the many-to-many relationship between quotations and platforms

5. **Quotation Tasks** (from the `quotation_tasks` table)
   - Fields: `id`, `quotation_id`, `task_description`, `man_days`, `created_at`
   - The `man_days` field represents the estimated effort for each specific task

6. **Reviews** (from the `reviews` table)
   - Fields: `id`, `quotation_id`, `rating`, `comment`, `created_at`

7. **Sessions** (from the `sessions` table)
   - Fields: `id`, `user_id`, `session_id`, `user_agent`, `errors`, `created_at`

## 2. Endpoints

### Users

- **POST** `/api/users/register`
  - **Description**: Register a new user using OAuth mechanisms (or basic registration if applicable).
  - **Request Body** (JSON):
    ```json
    {
      "email": "user@example.com",
      "role": "user"
    }
    ```
  - **Response**: 201 Created with the user data or relevant error responses.

- **POST** `/api/users/login`
  - **Description**: Handle user login. Typically integrated with an OAuth callback or token exchange flow.
  - **Request Body** (JSON):
    ```json
    {
      "email": "user@example.com",
      "password": "*****"  // password may be replaced with OAuth token flows
    }
    ```
  - **Response**: Access token, refresh token, and user data on success.

- **POST** `/api/users/logout`
  - **Description**: Log out the current user.
  - **Response**: Confirmation message with appropriate status code.

### Quotations

- **GET** `/api/quotations`
  - **Description**: Retrieve a paginated list of quotations for the authenticated user.
  - **Query Parameters**: `page`, `limit`, `sort`, `filter`
  - **Response**: JSON array of quotations with pagination meta data.

- **POST** `/api/quotations`
  - **Description**: Create a new quotation. This endpoint handles project descriptions, selected platforms, and estimation types. It automatically generates tasks with individual man-days estimations and applies a minimum 30% buffer based on the total estimated effort.
  - **Request Body** (JSON):
    ```json
    {
      "estimation_type": "Fixed Price" /* or "Time & Material" */,
      "scope": "Detailed project description up to 10000 characters",
      "platforms": ["platform_id_1", "platform_id_2"],
      "dynamic_attributes": { /* optional */ }
    }
    ```
  - **Response**: 201 Created with the complete quotation object including:
    - Generated tasks with individual `man_days` estimations
    - Total buffer calculated as 30% of the sum of all task estimations
    - Platform associations
    - AI reasoning for the estimations
  - **Error Conditions**: Returns 400 Bad Request if the `scope` exceeds 10000 characters or if required fields are missing.

- **GET** `/api/quotations/{id}`
  - **Description**: Retrieve detailed information of a specific quotation including associated tasks and reviews.
  - **Response**: Quotation object in JSON format with nested data if applicable.

- **PUT** `/api/quotations/{id}`
  - **Description**: Update an existing quotation. Typically allowed only before a final quotation is generated.
  - **Request Body** (JSON): Similar to the create payload; supports partial updates.
  - **Response**: The updated quotation object.

- **DELETE** `/api/quotations/{id}`
  - **Description**: Delete a quotation. This operation respects ownership enforced by security policies.
  - **Response**: Confirmation message upon successful deletion.

### Quotation Tasks

- **GET** `/api/quotations/{quotationId}/tasks`
  - **Description**: Retrieve all tasks associated with a quotation.
  - **Response**: JSON array of task objects.

- **POST** `/api/quotations/{quotationId}/tasks`
  - **Description**: Create a new task for a given quotation. This might be triggered automatically when generating the quotation, or manually added later.
  - **Request Body** (JSON):
    ```json
    { "task_description": "Detailed task description" }
    ```
  - **Response**: The newly created task object.

### Platforms

- **GET** `/api/platforms`
  - **Description**: Retrieve a list of all available platforms to be used when creating a quotation.
  - **Response**: JSON array of platform objects.

### Reviews

- **GET** `/api/quotations/{quotationId}/reviews`
  - **Description**: Retrieve all reviews for a specific quotation.
  - **Response**: JSON array of review objects.

- **POST** `/api/quotations/{quotationId}/reviews`
  - **Description**: Submit a new review for a quotation.
  - **Request Body** (JSON):
    ```json
    {
      "rating": 4,  // rating between 1 and 5
      "comment": "Optional review comment"
    }
    ```
  - **Response**: The created review object with status 201.

### Sessions

- **GET** `/api/sessions`
  - **Description**: (Internal) Retrieve a list of session records for the authenticated user.
  - **Response**: JSON array of session objects.

- **POST** `/api/sessions`
  - **Description**: (Internal) Record a new session when a user logs in.
  - **Response**: Newly created session record.

## 3. Authentication and Authorization

- **Authentication Mechanism**: The API uses OAuth-based authentication. Endpoints requiring authentication expect a valid access token in the request headers (e.g., using Bearer tokens).

- **Authorization**: User-specific endpoints (users, quotations, reviews, sessions) enforce that the authenticated user matches the resource owner. Additionally, PostgreSQL Row-Level Security (RLS) policies (e.g., on `quotations`, `quotation_tasks`, `reviews`, and `sessions`) ensure that users can access only their own data.

- **Middleware**: All protected endpoints will use middleware to verify tokens, extract user information, and enforce role-based access where required.

## 4. Validation and Business Logic

- **Input Validation**:
  - Enforce that the `scope` field does not exceed 10000 characters.
  - Ensure that at least one platform is selected when creating a quotation.
  - Validate that the review `rating` is between 1 and 5.

- **Business Logic**:
  - **Quotation Generation**: Upon creating a quotation, the system calculates `man_days` based on a standard workday of 5-6 hours and applies a minimum buffer of 30% (adjustable for complex projects). This may also trigger automatic creation of related tasks (stored in `quotation_tasks`).
  - **Review Handling**: Reviews are linked to quotations. Users can post ratings and optional comments, and the overall quotation presentation may aggregate review data.
  - **Automatic Task Generation**: As part of quotation creation, descriptive analysis of the project scope can lead to the generation of default tasks to be stored in the `quotation_tasks` table.
