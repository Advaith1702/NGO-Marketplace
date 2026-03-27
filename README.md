# NGOConnect — Surplus & Donation Marketplace

**NGOConnect** is a full-stack web application designed to bridge the gap between Non-Governmental Organizations (NGOs) with surplus resources and donors looking to make an impact. 

It provides a centralized platform where verified NGOs can share excess supplies (like food, medical gear, and clothing) with other organizations that urgently need them. Additionally, it allows individual donors to discover and securely fund verified NGOs.

---

## 🌟 Features

### 🛡️ Admin Verification System
- Ecosystem integrity managed by an Admin role.
- NGOs must be verified by the Admin before they can access the marketplace or receive donations.
- Comprehensive platform statistics on total registered users, active listings, and donation inflows.

### 🏛️ NGO Resource Sharing (Marketplace)
- Create active listings for surplus resources with quantity, category, and urgency level.
- Browse a centralized market of available surplus items from other NGOs.
- **Request System**: Request needed items and allow listing owners to Accept or Reject requests seamlessly.
- Real-time Ledger: Track outgoing requests and incoming requests.

### 💝 Donor Ecosystem
- Dedicated discovery page for donors to search for verified organizations by cause or region.
- Secure donation workflow (simulated) with custom contribution amounts and messages.
- Donor history ledger for personal contribution tracking.
- Corresponding ledger on the NGO dashboard showing incoming funds.

---

## 🛠 Tech Stack 

- **Frontend:** React (Vite), React Router
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Authentication:** JWT (JSON Web Tokens), bcrypt for password hashing
- **Styling:** Custom Vanilla CSS with modern dark mode and glassmorphism UI elements

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or a cloud Atlas connection string)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/ngo-marketplace.git
cd ngo-marketplace
```

### 2. Install Dependencies
You need to install dependencies for both the backend server and the frontend client.

**For the Backend:**
```bash
cd server
npm install
```

**For the Frontend:**
```bash
cd ../client
npm install
```

### 3. Environment Configuration
In the root directory of the project, use the provided example template to create your variables file:

```bash
cp .env.example .env
```
Open the `.env` file and ensure your variables look similar to this:
```env
MONGO_URI=mongodb://localhost:27017/ngo-marketplace
JWT_SECRET=your_super_secret_key_here
PORT=5000
```

### 4. Admin Database Seeding
To access the Admin dashboard, run the provided seed script to create the initial admin user. Ensure your MongoDB instance is running before doing this.

```bash
cd server
npm run seed
```

*The default login for the Admin will be:*
- **Email:** `admin@ngomarketplace.com`
- **Password:** `admin123`

---

## 💻 Running the Application

To run the full stack locally, you need to start both the server and the client development servers.

### Start the Backend Server
```bash
cd server
npm start
```
*The API will run at `http://localhost:5000`.*

### Start the Frontend Client (In a new terminal tab)
```bash
cd client
npm run dev
```
*The app will be accessible at `http://localhost:5173`.*

---

## 🧪 Testing the Flows

Once running, here's how you can test the platform:

1. **Admin Login:** Go to `http://localhost:5173/login`, use the seeded Admin credentials. Check the active registered user stats.
2. **NGO Flow:** Register an account as an NGO. Log back into the Admin account, navigate to the dashboard table, and mark the new NGO as **Verified**.
3. **Marketplace Flow:** Log into the verified NGO and create a listing. Create a second NGO and request that listing.
4. **Donor Flow:** Register as a Donor (auto-verified). Go to the "Explore" tab, find an NGO, and try making a donation.

---

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).
