# Contact Identity Reconciliation Service

This is a Node.js backend service that implements identity reconciliation for contacts based on email and phone number. It links multiple contact entries belonging to the same customer by identifying and consolidating related contact information.

---

## Features

- Identify and consolidate contacts using email and/or phone number.
- Link multiple contacts with `primary` and `secondary` roles.
- Automatically create new contacts or link existing ones based on input.
- Returns consolidated contact info in a single response.
- Uses MongoDB to store and manage contact data.

---

## Tech Stack

- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- Deployed on Render.com (https://mybitespeed-task.onrender.com/)

---

### POST `/identify`

Accepts a JSON body with either or both of:

```json
{
  "email": "string (optional)",
  "phoneNumber": "string (optional)"
}
```
Clone the Repo:
- git clone https://github.com/varun-bitespeed/varun-bitespeed.git

- cd varun-bitespeed

Install Dependencies:

- npm install

Better to go to the hosted site and then just directly fire your requests via Postman or CURL.

