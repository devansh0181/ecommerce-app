# register a customer
http://localhost:3000/api/auth/register
{
  "email": "customer@test.com",
  "password": "password123",
  "role": "CUSTOMER",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
responce :
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTllOWNmYi00NzI2LTQ3MjgtYTY3My0zYTQzZDBkMTE1NzQiLCJlbWFpbCI6ImN1c3RvbWVyQHRlc3QuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzgwMTM0MjIxLCJleHAiOjE3ODA3MzkwMjF9.95n5_Gosncp77rnPNyHCb480B3E9UCZbZ-eCN4sq6rk",
    "user": {
        "id": "119e9cfb-4726-4728-a673-3a43d0d11574",
        "email": "customer@test.com",
        "role": "CUSTOMER",
        "firstName": "John",
        "lastName": "Doe"
    }
}
# register a barber
http://localhost:3000/api/auth/register
{
  "email": "barber@test.com",
  "password": "password123",
  "role": "BARBER",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+0987654321"
}
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjlkMDU3Yi1lYWNjLTQxZjktYjRjNy05NDNhZmNiZWZjYmIiLCJlbWFpbCI6ImJhcmJlckB0ZXN0LmNvbSIsInJvbGUiOiJCQVJCRVIiLCJpYXQiOjE3ODAxMzQzMjMsImV4cCI6MTc4MDczOTEyM30.E49dmeqx7M88iCsvO5BBNP1D_TpvEekvWtKiC6Q7Czo",
    "user": {
        "id": "db9d057b-eacc-41f9-b4c7-943afcbefcbb",
        "email": "barber@test.com",
        "role": "BARBER",
        "firstName": "Jane",
        "lastName": "Smith"
    }
}
# login as customer
http://localhost:3000/api/auth/login
{
  "email": "customer@test.com",
  "password": "password123"
}
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTllOWNmYi00NzI2LTQ3MjgtYTY3My0zYTQzZDBkMTE1NzQiLCJlbWFpbCI6ImN1c3RvbWVyQHRlc3QuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxNzgwMTM0NTcwLCJleHAiOjE3ODA3MzkzNzB9._VsBWk-d24lHWWf44-NDywy5FjlBWVxBWqJpv5Hxa0o",
    "user": {
        "id": "119e9cfb-4726-4728-a673-3a43d0d11574",
        "email": "customer@test.com",
        "role": "CUSTOMER",
        "firstName": "John",
        "lastName": "Doe"
    }
}
# login as barber
http://localhost:3000/api/auth/login
{
  "email": "barber@test.com",
  "password": "password123"
}
{
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkYjlkMDU3Yi1lYWNjLTQxZjktYjRjNy05NDNhZmNiZWZjYmIiLCJlbWFpbCI6ImJhcmJlckB0ZXN0LmNvbSIsInJvbGUiOiJCQVJCRVIiLCJpYXQiOjE3ODAxMzQ3NjksImV4cCI6MTc4MDczOTU2OX0.jjz6Ub1yp4pAH4ocA_NyXW4rflg11cB3HnGsTd3p418",
    "user": {
        "id": "db9d057b-eacc-41f9-b4c7-943afcbefcbb",
        "email": "barber@test.com",
        "role": "BARBER",
        "firstName": "Jane",
        "lastName": "Smith"
    }
}
# create a salone
 * only barber can create a salone
 * first we have to login as barber to get the access token and then we can use that token to create a salone
http://localhost:3000/api/salons
{
  "name": "Premium Cuts Salon",
  "description": "Best haircuts and grooming services in town",
  "address": "123 Main Street, New York, NY 10001",
  "latitude": 40.7128,
  "longitude": -74.0060
}
{
    "name": "Premium Cuts Salon",
    "description": "Best haircuts and grooming services in town",
    "address": "123 Main Street, New York, NY 10001",
    "latitude": 40.7128,
    "longitude": -74.006,
    "ownerId": "db9d057b-eacc-41f9-b4c7-943afcbefcbb",
    "isOpen": false,
    "rating": "0.0",
    "openedAt": null,
    "closedAt": null,
    "id": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
    "createdAt": "2026-05-30T04:31:28.830Z",
    "updatedAt": "2026-05-30T04:31:28.830Z"
}
# Set Working Hours
 * only barber can set working hours for their salone
 * get and put request 
 * every 15 minites our cron job will check the current time and update the isOpen status of the salone accordingly based on the working hours set by the barber
http://localhost:3000/api/salons/6540ff6e-1372-45f0-8a91-24ab64d5ab32/working-hours
{
  "workingHours": [
    {
      "dayOfWeek": "MONDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "TUESDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "THURSDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "FRIDAY",
      "openTime": "09:00:00",
      "closeTime": "18:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "SATURDAY",
      "openTime": "10:00:00",
      "closeTime": "16:00:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "SUNDAY",
      "openTime": "00:00:00",
      "closeTime": "00:00:00",
      "isClosed": true
    }
  ]
}
[
    {
        "id": "4f013472-1e32-4422-b245-09186eb1fb0f",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "MONDAY",
        "openTime": "09:00:00",
        "closeTime": "18:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "43d0004e-af6f-409f-8039-ec08a2817030",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "TUESDAY",
        "openTime": "09:00:00",
        "closeTime": "18:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "267058d9-9010-43a4-8290-7d09c9117143",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "WEDNESDAY",
        "openTime": "09:00:00",
        "closeTime": "18:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "6abaf9c8-058a-4af3-9337-b6079b62c0b1",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "THURSDAY",
        "openTime": "09:00:00",
        "closeTime": "18:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "fc24d488-f731-4695-a9af-b96a1326d5c2",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "FRIDAY",
        "openTime": "09:00:00",
        "closeTime": "18:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "64d5f53e-58f5-49f2-8427-ac69c62ea4fd",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "SATURDAY",
        "openTime": "10:00:00",
        "closeTime": "16:00:00",
        "isClosed": false,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    },
    {
        "id": "29f6c4e1-2c0f-4966-ac60-6a1e7fa96e03",
        "createdAt": "2026-05-30T04:50:50.498Z",
        "updatedAt": "2026-05-30T04:50:50.498Z",
        "dayOfWeek": "SUNDAY",
        "openTime": "00:00:00",
        "closeTime": "00:00:00",
        "isClosed": true,
        "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
    }
]
# Create Service 
 * only barber can create a service for their salone
http://localhost:3000/api/salons/6540ff6e-1372-45f0-8a91-24ab64d5ab32/services
{
  "name": "Hot Towel Shave",
  "description": "Luxury hot towel shave experience",
  "price": 30.00,
  "durationMinutes": 45
}
{
    "name": "Hot Towel Shave",
    "description": "Luxury hot towel shave experience",
    "price": 30,
    "durationMinutes": 45,
    "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
    "isActive": true,
    "id": "f9853a45-4469-41b6-bcf9-26e726fd716c",
    "createdAt": "2026-05-30T05:23:01.851Z",
    "updatedAt": "2026-05-30T05:23:01.851Z"
}
{
  "name": "Kids Haircut",
  "description": "Haircut for children under 12",
  "price": 18.00,
  "durationMinutes": 25
}
{
    "name": "Kids Haircut",
    "description": "Haircut for children under 12",
    "price": 18,
    "durationMinutes": 25,
    "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
    "isActive": true,
    "id": "091a13fb-42ae-4fe0-97ee-86e2842069e6",
    "createdAt": "2026-05-30T05:24:16.748Z",
    "updatedAt": "2026-05-30T05:24:16.748Z"
}
# Create Booking 
 * Customer token (from auth/login)
 * Barber token (from auth/login)
 * Salon ID with working hours set
 * At least 3 active services
http://localhost:3000/api/bookings
{
  "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
  "serviceIds": ["091a13fb-42ae-4fe0-97ee-86e2842069e6","f9853a45-4469-41b6-bcf9-26e726fd716c"],
  "preferredTime": "2026-06-01T04:30:00.000Z"
}
{
    "id": "c1ca3708-9fc8-4600-8a7a-5075ba158ffa",
    "createdAt": "2026-05-30T07:10:32.457Z",
    "updatedAt": "2026-05-30T07:10:32.457Z",
    "status": "PENDING",
    "preferredTime": "2026-06-01T04:30:00.000Z",
    "totalDurationMinutes": 70,
    "totalPrice": "48.00",
    "rejectionReason": null,
    "acceptedAt": null,
    "completedAt": null,
    "customerId": "119e9cfb-4726-4728-a673-3a43d0d11574",
    "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
    "customer": {
        "id": "119e9cfb-4726-4728-a673-3a43d0d11574",
        "createdAt": "2026-05-30T04:13:42.213Z",
        "updatedAt": "2026-05-30T04:13:42.213Z",
        "email": "customer@test.com",
        "password": "$2b$10$oUfKd2K2bheiX8bQnqt8EesryI7.5lF1emDwd2raEGZXZc5nlySNq",
        "role": "CUSTOMER",
        "firstName": "John",
        "lastName": "Doe",
        "phone": "+1234567890"
    },
    "salon": {
        "id": "6540ff6e-1372-45f0-8a91-24ab64d5ab32",
        "createdAt": "2026-05-30T04:31:28.830Z",
        "updatedAt": "2026-05-30T07:10:20.624Z",
        "name": "Premium Cuts & Spa",
        "description": "Updated description with spa services",
        "address": "123 Main Street, New York, NY 10001",
        "rating": "0.0",
        "isOpen": true,
        "openedAt": "2026-05-30T12:40:19.681Z",
        "closedAt": "2026-05-30T10:45:00.757Z",
        "ownerId": "db9d057b-eacc-41f9-b4c7-943afcbefcbb"
    },
    "bookingServices": [
        {
            "id": "faa9616f-aed5-4705-9f56-ebb612d7f329",
            "createdAt": "2026-05-30T07:10:32.692Z",
            "updatedAt": "2026-05-30T07:10:32.692Z",
            "priceAtBooking": "30.00",
            "durationAtBooking": 45,
            "bookingId": "c1ca3708-9fc8-4600-8a7a-5075ba158ffa",
            "serviceId": "f9853a45-4469-41b6-bcf9-26e726fd716c",
            "service": {
                "id": "f9853a45-4469-41b6-bcf9-26e726fd716c",
                "createdAt": "2026-05-30T05:23:01.851Z",
                "updatedAt": "2026-05-30T05:23:01.851Z",
                "name": "Hot Towel Shave",
                "description": "Luxury hot towel shave experience",
                "price": "30.00",
                "durationMinutes": 45,
                "isActive": true,
                "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
            }
        },
        {
            "id": "22049053-9c35-426c-bb75-06d2e98f8876",
            "createdAt": "2026-05-30T07:10:32.692Z",
            "updatedAt": "2026-05-30T07:10:32.692Z",
            "priceAtBooking": "18.00",
            "durationAtBooking": 25,
            "bookingId": "c1ca3708-9fc8-4600-8a7a-5075ba158ffa",
            "serviceId": "091a13fb-42ae-4fe0-97ee-86e2842069e6",
            "service": {
                "id": "091a13fb-42ae-4fe0-97ee-86e2842069e6",
                "createdAt": "2026-05-30T05:24:16.748Z",
                "updatedAt": "2026-05-30T05:24:16.748Z",
                "name": "Kids Haircut",
                "description": "Haircut for children under 12",
                "price": "18.00",
                "durationMinutes": 25,
                "isActive": true,
                "salonId": "6540ff6e-1372-45f0-8a91-24ab64d5ab32"
            }
        }
    ]
}