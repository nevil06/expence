const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage (for demo purposes)
const users = [];
const expenses = [];
const categories = [
    { id: '1', name: 'Food', icon: '🍔', color: '#FF6B6B' },
    { id: '2', name: 'Transport', icon: '🚗', color: '#4ECDC4' },
    { id: '3', name: 'Shopping', icon: '🛍️', color: '#45B7D1' },
    { id: '4', name: 'Entertainment', icon: '🎬', color: '#FFA07A' },
    { id: '5', name: 'Bills', icon: '💡', color: '#98D8C8' },
];

// Helper function to generate token
const generateToken = (userId) => {
    return `token_${userId}_${Date.now()}`;
};

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In production, hash this!
        createdAt: new Date().toISOString()
    };

    users.push(user);
    const token = generateToken(user.id);

    res.status(201).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    });
});

app.post('/api/auth/reset-password', (req, res) => {
    const { email } = req.body;

    const user = users.find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'Password reset link sent to your email' });
});

app.post('/api/auth/update-password', (req, res) => {
    const { password, token } = req.body;

    // Simple mock - in production, verify token properly
    res.json({ message: 'Password updated successfully' });
});

// Expense routes
app.get('/api/expenses', (req, res) => {
    res.json({ expenses });
});

app.post('/api/expenses', (req, res) => {
    const expense = {
        id: `expense_${Date.now()}`,
        ...req.body,
        createdAt: new Date().toISOString()
    };
    expenses.push(expense);
    res.status(201).json(expense);
});

app.put('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Expense not found' });
    }

    expenses[index] = { ...expenses[index], ...req.body };
    res.json(expenses[index]);
});

app.delete('/api/expenses/:id', (req, res) => {
    const { id } = req.params;
    const index = expenses.findIndex(e => e.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Expense not found' });
    }

    expenses.splice(index, 1);
    res.status(204).send();
});

// Category routes
app.get('/api/categories', (req, res) => {
    res.json({ categories });
});

app.post('/api/categories', (req, res) => {
    const category = {
        id: `category_${Date.now()}`,
        ...req.body
    };
    categories.push(category);
    res.status(201).json(category);
});

// Settings routes
app.get('/api/settings', (req, res) => {
    res.json({
        currency: 'USD',
        language: 'en',
        notifications: true
    });
});

app.put('/api/settings', (req, res) => {
    res.json(req.body);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock backend server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/health`);
    console.log(`\n✅ Ready to accept requests!`);
});
