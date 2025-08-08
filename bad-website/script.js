// DOM Elements
const colorBtn = document.getElementById('colorBtn');
const body = document.body;

// Counter elements
const counterValue = document.getElementById('counterValue');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

// Todo elements
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');

// Quote elements
const quoteText = document.getElementById('quoteText');
const quoteBtn = document.getElementById('quoteBtn');

// Contact form elements
const contactForm = document.getElementById('contactForm');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
const messageInput = document.getElementById('messageInput');

// State variables
let counter = 0;
let todos = [];
let isDarkTheme = false;

// Inspirational quotes
const quotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The only impossible journey is the one you never begin. - Tony Robbins",
    "In the middle of difficulty lies opportunity. - Albert Einstein",
    "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Don't let yesterday take up too much of today. - Will Rogers"
];

// Theme Toggle Functionality
colorBtn.addEventListener('click', () => {
    isDarkTheme = !isDarkTheme;
    body.classList.toggle('dark-theme', isDarkTheme);
    colorBtn.textContent = isDarkTheme ? 'Light Theme' : 'Dark Theme';
    
    // Add smooth transition effect
    body.style.transition = 'all 0.3s ease';
});

// Counter Functionality
function updateCounter() {
    counterValue.textContent = counter;
    
    // Add animation effect
    counterValue.style.transform = 'scale(1.2)';
    setTimeout(() => {
        counterValue.style.transform = 'scale(1)';
    }, 200);
}

incrementBtn.addEventListener('click', () => {
    counter++;
    updateCounter();
});

decrementBtn.addEventListener('click', () => {
    counter--;
    updateCounter();
});

resetBtn.addEventListener('click', () => {
    counter = 0;
    updateCounter();
});

// Todo List Functionality
function createTodoItem(text, index) {
    const li = document.createElement('li');
    li.className = 'todo-item';
    li.innerHTML = `
        <span class="todo-text" onclick="toggleTodo(${index})">${text}</span>
        <button class="delete-btn" onclick="deleteTodo(${index})">Delete</button>
    `;
    return li;
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const todoItem = createTodoItem(todo.text, index);
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        todoList.appendChild(todoItem);
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (text !== '') {
        todos.push({ text, completed: false });
        todoInput.value = '';
        renderTodos();
    }
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    renderTodos();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    renderTodos();
}

// Event listeners for todo
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Quote Generator Functionality
function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

quoteBtn.addEventListener('click', () => {
    const quote = getRandomQuote();
    quoteText.textContent = quote;
    
    // Add fade effect
    quoteText.style.opacity = '0';
    setTimeout(() => {
        quoteText.style.opacity = '1';
    }, 200);
});

// Contact Form Functionality
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();
    
    if (name && email && message) {
        // Simulate form submission
        alert(`Thank you, ${name}! Your message has been sent successfully.`);
        
        // Reset form
        nameInput.value = '';
        emailInput.value = '';
        messageInput.value = '';
        
        // Add success animation
        contactForm.style.transform = 'scale(0.95)';
        setTimeout(() => {
            contactForm.style.transform = 'scale(1)';
        }, 200);
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add scroll effect to header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(102, 126, 234, 0.95)';
    } else {
        header.style.background = 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))';
    }
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('JavaScript Demo Site Loaded Successfully!');
    
    // Add welcome animation
    const heroContent = document.querySelector('.hero-content');
    heroContent.style.opacity = '0';
    heroContent.style.transform = 'translateY(30px)';
    
    setTimeout(() => {
        heroContent.style.transition = 'all 0.8s ease';
        heroContent.style.opacity = '1';
        heroContent.style.transform = 'translateY(0)';
    }, 300);
});

// Expose functions to global scope for onclick handlers
window.toggleTodo = toggleTodo;
window.deleteTodo = deleteTodo; 