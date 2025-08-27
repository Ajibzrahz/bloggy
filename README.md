# 📖 Bloggy API (Blog Platform Backend)

A backend application for a blogging platform where users can write, edit, and delete blog posts. Other users can read and comment on posts. Supports user roles (admin & regular users).

---

## 🚀 Features
- 👤 **User Authentication** (Register & Login)  
- ✍️ **CRUD operations for blog posts**  
- 💬 **Comment system on posts**  
- 👍 **Like/Unlike posts & comments**  
- 🔑 **User roles & permissions** (Admin vs Regular user)  
- 🕵️ **Profile Management** (view/update/delete profile)  

---

## 🏗️ Project Structure
```bash
bloggy-api/
│── controllers/      # Handles request logic
│── models/           # Mongoose schemas (User, Post, Comment, report)
│── routes/           # API routes
│── middlewares/      # Authentication & error handling
│── utils/            # Helpers (mailer etc.)
│── errors/           # Custom error classes
│── .env              # Environment variables
│── index.js         # Entry point
│── README.md         # Documentation


