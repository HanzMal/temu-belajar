const express = require('express');
const session = require('express-session');
const app = express()
const port = process.env.PORT || 3000
const path = require('path')

const { Pool } = require('pg')
require("dotenv").config()
const {Sequelize, DataTypes, Op} = require('sequelize')

// middleware
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.use(express.static('public'))
app.use(session({
    secret: process.env.SECTION_SECRET,
    resave: false,
    saveUninitialized: false
}))

// set view engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    logging: console.log,
    dialectOptions: {
        useUTC: false,
    },
    timezone: '+07:00'
});

// models
const User = sequelize.define('User', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    name: {type: DataTypes.STRING(255), allowNull: false},
    email: {type: DataTypes.STRING(255), allowNull: false, unique: false},
    password: {type: DataTypes.STRING(255), allowNull: false},
    phone: {type: DataTypes.STRING(20), allowNull: false},
    role: {type: DataTypes.STRING(10), defaultValue: 'user'},
    avatar: {type: DataTypes.STRING(255), allowNull: false},
}, {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

const Category = sequelize.define('Category', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    name: {type: DataTypes.STRING(255), allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
    icon: {type: DataTypes.STRING(50), allowNull: false},
}, {
    tableName: 'categories',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false
})

const Event = sequelize.define('Event', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    title: {type: DataTypes.STRING(255), allowNull: false},
    description: {type: DataTypes.TEXT, allowNull: false},
    image_path: {type: DataTypes.STRING(255), allowNull: false},
    venue: {type: DataTypes.STRING(255), allowNull: false},
    event_date: {type: DataTypes.DATE, allowNull: false},
    event_end_date: {type: DataTypes.DATE, allowNull: false},
    max_attendees: {type: DataTypes.INTEGER, allowNull: false},
    price: {type: DataTypes.DECIMAL(10,2), allowNull: false},
    available_tickets: {type: DataTypes.INTEGER, allowNull: false},
    is_published: {type: DataTypes.BOOLEAN, defaultValue: false},
}, {
    tableName: 'events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

const Order = sequelize.define('Order', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    quantity: {type: DataTypes.INTEGER, allowNull: false},
    total_amount: {type: DataTypes.DECIMAL(10,2), allowNull: false},
    status: { type: DataTypes.ENUM('pending', 'paid', 'cancelled', 'expired'), defaultValue: 'pending'},
    xendit_invoice_id: {type: DataTypes.STRING(255)},
    xendit_payment_url: {type: DataTypes.TEXT},
    xendit_expiry_date: {type: DataTypes.DATE},
    external_id: {type: DataTypes.STRING(255)}
}, {
    tableName: 'orders',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

const Ticket = sequelize.define('Ticket', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    ticket_code: {type: DataTypes.STRING(100), allowNull: false, unique: true},
    barcode_data: {type: DataTypes.TEXT, allowNull: false},
    attendee_name: { type: DataTypes.STRING(255), allowNull: false},
    attendee_email: { type: DataTypes.STRING(255), allowNull: false},
    attendee_phone: { type: DataTypes.STRING(20), allowNull: false},
    is_attended: {type: DataTypes.BOOLEAN, defaultValue: false},
    attended_at: {type: DataTypes.DATE}
}, {
    tableName: 'tickets',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

const EventAttachment = sequelize.define('EventAttachment', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement:true},
    file_path: {type: DataTypes.STRING(255), allowNull: false},
    file_type: {type: DataTypes.ENUM('image', 'document'), defaultValue: 'image'},
}, {
    tableName: 'event_attachments',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

// relasi
User.hasMany(Event, {
    foreignKey: 'creator_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Event.belongsTo(User, {
    foreignKey: 'creator_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Category.hasMany(Event, {
    foreignKey: 'category_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Event.belongsTo(Category, {
    foreignKey: 'category_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

User.hasMany(Order, {
    foreignKey: 'user_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Order.belongsTo(User, {
    foreignKey: 'user_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Event.hasMany(Order, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Order.belongsTo(Event, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Order.hasMany(Ticket, {
    foreignKey: 'order_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})
Ticket.belongsTo(Order, {
    foreignKey: 'order_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

//
Event.hasMany(Ticket, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

Ticket.belongsTo(Event, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

//
Event.hasMany(EventAttachment, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})
EventAttachment.belongsTo(Event, {
    foreignKey: 'event_id',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE',
})

// Semua controller 
app.get('/', async(req, res) => {
    try{
        const categories = await Category.findAll()
        let cities = []

        try{
            const citiesData = await Event.findAll({
                attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('city')), 'city']],
                where: {is_published: true},
                order: [['city', 'ASC']]
            })

            cities = citiesData.map(c => c.city).filter(city => city)
        } catch(error) {
            console.log('Error Fetching Data city', error)
            cities = ['Jakarta', 'Bandung', 'Semarang', 'Yogyakarta']
        }

        const latestEvents = await Event.findAll({
            where: {is_published: true},
            include: [Category, User],
            order: [['created_at', 'DESC']],
            limit: 6
        })

        const upcomingEvents = await Event.findAll({
            where: {
                is_published: true,
                event_date: {[Op.gte]: new Date()}
            },
            include: [Category, User],
            order: [['created_at', 'DESC']],
            limit: 6
        })

        res.render('home', {
            user: req.session.user,
            categories,
            cities: cities,
            latestEvents,
            upcomingEvents
        })
    } catch (error) {
        console.error(error)
        res.status(500).send('Server Error')
    }
})

// sinkronisasi table database
async function syncDatabase() {
    try {
        await sequelize.sync({ alter: true });
        console.log('All tables has been synchronized successfully.');
    } catch (error) {
        console.error('Error synchronizing database:', error);
    }
}

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log("Database synchronized successfully");

        await syncDatabase();

        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

startServer()