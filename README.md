# Fitmate

This is a Node.js project using Hapi framework for handling workout data retrieval. Below are the details and instructions to run the project.

## Installation

Before running the project, make sure you have the required software installed locally:

Node.js (version 12 or higher)
npm (Node Package Manager)
MySQL database
After installing the required software, clone the project and install the dependencies:

```bash
  git clone https://github.com/Fitmate-capstone/back-end.git
  cd back-end
  npm install
```

## Database Configuration

### Import database

Download and import this database to your local database:
https://drive.google.com/file/d/1fBE9pK6wuMFZ_dYNSjmIqmIDfdR6TrJO/view?usp=sharing

### Database set up

Ensure that you have a MySQL database set up. Create a .env file in the project root and add the following variables:

```env
PORT=your-custom-port(or you can blank this so default PORT will be chosen)
DB_HOST=your-database-host
DB_USER=your-database-username
DB_PASS=your-database-password
DB_NAME=your-database-name

Replace your-custom-port, your-database-host, your-database-username, your-database-password, and your-database-name with your actual MySQL database credentials.
```

## Running the Project

Start the server using the following command:

```
npm run dev
```

The server will be accessible at http://YOUR_IP:your-custom-port

## API Endpoints

### Get Exercise List

Path Example: /getExercise?muscle_id=4

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": 200,
    "data": [example_data]
}
```

### Get Exercise by Equipment

Path Example: /getExerciseByEquipment?equipment=dumbbell

Method: GET

Example Response

```
{
  "status": "Success",
  "message": "Data berhasil diambil",
  "code": 200,
  "data": [example_data]
}
```

### Get Exercise by Query

Path: /getExerciseByQuery?query=curl

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": 200,
    "data": [example_data]
}
```

### Get Detail Exercise

Path: /getDetailExercise?exercise_id=3

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": 200,
    "data": {example_data}
}
```

### Get Muscle List

Path: /getMuscle

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": 200,
    "data": [example_data]
}
```

### Get Category List

Path: /getCategory

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": [example_data]
}
```

### Get Top Rated Exercises

Path: /getTopRatedExercise?limit=5

Method: GET

Example Response

```
{
    "status": "Success",
    "message": "Data berhasil diambil",
    "code": 200,
    "data": [example_data]
}
```
