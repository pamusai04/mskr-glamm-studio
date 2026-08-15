# MSKR GLAMM STUDIO

A full-stack beauty salon management and service booking application that allows customers to explore salon services, manage their profiles, add services to a cart, book appointments, apply offers, and submit reviews. Administrators can manage services, bookings, offers, users, images, QR codes, and other salon content.

## 🚀 Features

### Customer

* Landing page with salon information
* Browse services and categories
* User registration and email OTP verification
* Secure login and authentication
* Profile management
* Service cart
* Service availability checking
* Apply offers
* Book salon services
* Booking history
* Submit reviews
* Password reset and password change

### Administrator

* Admin authentication
* Dashboard
* Manage services
* Manage service metadata
* Manage bookings
* Update booking status
* Manage users
* Manage reviews
* Manage offers
* Manage hero images
* Manage event photos
* Manage QR code
* Manage shop closure dates

## 🏗️ Architecture

```text
Customer Web / Mobile
          │
Admin Web / Mobile
          │
          ▼
   React Frontend
          │
     REST API
          │
          ▼
 Node.js + Express.js
          │
 ┌────────┼─────────┐
 │        │         │
 ▼        ▼         ▼
Auth    User      Admin
 │        │         │
 └────────┼─────────┘
          │
          ▼
    Mongoose ORM
          │
 ┌────────┼──────────────┐
 ▼        ▼              ▼
MongoDB  Redis       Cloudinary
 Atlas
          │
          ▼
        Brevo
```

## 🛠️ Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* REST API
* JWT Authentication
* Cookie-based Authentication
* bcrypt

### Database & Storage

* MongoDB Atlas
* Redis
* Cloudinary

### Email

* Brevo

### Deployment

* Render

## 🔐 Authentication

The application uses secure authentication with:

* JWT access tokens
* Refresh tokens
* HTTP-only cookies
* Redis-based session management
* Email OTP verification
* Password reset through OTP
* Role-based access for users and administrators


## 🔒 Security

The application includes:

* JWT authentication
* HTTP-only cookies
* Password hashing using bcrypt
* CORS configuration
* API rate limiting
* User authentication middleware
* Admin authorization middleware
* Input validation
* Refresh-token session validation

## 👨‍💻 Project

**Project Name:** MSKR GLAMM STUDIO

**Type:** Full-Stack Beauty Salon Management & Booking Platform

**Architecture:** Client–Server Architecture

**Backend:** Node.js + Express.js

**Database:** MongoDB Atlas

**Frontend:** React + Vite
