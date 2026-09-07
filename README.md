# Corporate Reporting System

A full-stack web application developed during my Software Engineering Internship at the **İsdemir (İskenderun Iron and Steel Inc.) - Production Applications Directorate**. This project digitalizes the hierarchical daily reporting workflow among production engineers, chief engineers, and managers in a heavy industry environment.

## 🚀 Key Features

* **Role-Based Workflow:** Distinct dashboards and authorization scopes for Engineers, Chief Engineers, and Managers.
* **Dynamic Form Management:** Asynchronous state-managed React forms that allow engineers to add or remove multiple work items dynamically before submission.
* **Partial Merge Algorithm:** A custom business logic implementation allowing Chief Engineers to cherry-pick specific approved items from an engineer's report. Selected items are merged into a new "Master Report" for the manager, while unselected items safely remain in the pending queue without data loss.
* **Revision & Rejection Cycles:** Advanced status tracking (`WAITING_CHEF`, `WAITING_MANAGER`, `REJECTED_BY_MANAGER`). Master reports rejected by the manager are automatically routed back to the Chief's pending list for necessary revisions instead of being permanently archived.
* **Dynamic Time-Stamped Archiving:** Automated timestamping using Java's `IsoFields.WEEK_OF_WEEK_BASED_YEAR` to group completed (`MERGED`, `APPROVED`) reports into navigable weekly folders on the frontend.

## 🛠️ Technology Stack

**Backend:**
* Java 21 LTS
* Spring Boot
* PostgreSQL
* Hibernate / JPA (One-to-Many Relational Mapping)

**Frontend:**
* React.js
* Axios (RESTful API communication)

## ⚙️ Database Architecture Highlights
The system utilizes a granular, relational database model rather than monolithic text blocks. A bidirectional `One-to-Many` relationship is established between the `Report` and `ReportItem` entities. JSON serialization issues (Infinite Recursion/Circular Reference) typical in bidirectional JPA relationships were resolved using strategic `@JsonIgnore` implementations.

## 💡 Acknowledgements
Special thanks to my mentors, Senior Software Engineers **Sevda Keçeci** and **Ceylan Kıvılcım**, for their technical guidance, code reviews, and for sharing their invaluable industry experience during the SDLC of this project.
