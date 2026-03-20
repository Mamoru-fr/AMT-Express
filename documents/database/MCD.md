```mermaid
erDiagram
    User {
        🔑 name
        ‎ email
        ‎ image
        ‎ role
        ‎ banned
        ‎ accountingCode
        ‎ vehicleType
        ‎ vehiclePlate
        ‎ vehicleColor
        ‎ vehicleModel
        ‎ available
    }
    Course {
        🔑 courseName
        ‎ departure
        ‎ destination
        ‎ departureTime
        ‎ arrivalTime
        ‎ price
        ‎ distanceKM
        ‎ status
        ‎ waitingTime
        ‎ customerNotes
    }
    Shift {
        🔑 ShiftName
        ‎ startDate
        ‎ endDate
        ‎ status
    }
    Option {
        🔑 name
        ‎ description
        ‎ price
    }
    Project {
        🔑 name
        ‎ startDate
        ‎ endDate
    }
    Production {
        🔑 name
        ‎ address
        ‎ contactName
        ‎ contactEmail
        ‎ contactPhone
    }
    Invoice {
        🔑 number
        ‎ invoiceDate
        ‎ dueDate
        ‎ totalPrice
        ‎ taxAmount
        ‎ subtotal
        ‎ status
        ‎ reminderSent
        ‎ lastReminderDate
    }
    Course }o--|| User : "has driver"
    Course }o--|| Production : "belongs to production"
    Course }o--|| Project : "belongs to project"
    Course }o--|| User : "belongs to course"
    Shift }o--|| User : "has driver"
    Shift }o--|| Production : "belongs to production"
    Shift }o--|| Project : "belongs to project"
    Course }o--|| Option : "has option"
    Shift }o--|| Option : "has option"
    Course }o--|| Invoice : "has invoice"
```

| Course                         |
| ------------------------------ |
| **CourseName**                 |
| Departure                      |
| Destination                    |
| DepartureTime                  |
| ArrivalTime                    |
| Price                          |
| DistanceKM                     |
| Status                         |
| Waiting Time                   |
| CustomerNotes                  |
| <ins>**#DriverName**</ins>     |
| <ins>**#Productionname**</ins> |
| <ins>**#ProjectName**</ins>    |

| User            |
| --------------- |
| **Name**        |
| Email           |
| Image           |
| Role            |
| Banned          |
| Accounting Code |
| Vehicle Type    |
| Vehicle Plate   |
| Vehicle Color   |
| Vehicle Model   |
| Available       |

| CourseClient                 |
| ---------------------------- |
| <ins>**#CourseName**</ins>   |
| <ins>**#CustomerName**</ins> |

| Shift                         |
| ----------------------------- |
| <ins>**#DriverName**</ins>    |
| StartDate                     |
| EndDate                       |
| Status                        |
| <ins>**ProductionName**</ins> |
| <ins>**ProjectName**</ins>    |

| Option      |
| ----------- |
| **Name**    |
| Description |
| Price       |

| OptionCourse               |
| -------------------------- |
| <ins>**#OptionName**</ins> |
| <ins>**#CourseName**</ins> |

| Project                       |
| ----------------------------- |
| **Name**                      |
| <ins>**ProductionName**</ins> |
| StartDate                     |
| EndDate                       |

| Production    |
| ------------- |
| **Name**      |
| Address       |
| Contact Name  |
| Contact Email |
| Contact Phone |

| Invoice                    |
| -------------------------- |
| **Number**                 |
| <ins>**#CourseName**</ins> |
| InvoiceDate                |
| DueDate                    |
| totalPrice                 |
| taxAmount                  |
| Subtotal                   |
| Status                     |
| reminderSent               |
| lastReminderDate           |

