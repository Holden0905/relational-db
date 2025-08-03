console.log('Component Tracker Loaded')

const SUPABASE_URL = 'https://xonkcxtziopnrmtmbccl.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhvbmtjeHR6aW9wbnJtdG1iY2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQyNDQyNTIsImV4cCI6MjA2OTgyMDI1Mn0.aV0o2ufPTzAn9hCxEJq1rGrB1EauRqfZYhbrGHt2JCM'

const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function loadComponents() {
    try {
        console.log('Loading components...')
        const { data, error } = await client.from('Component Table').select('*')
        
        if (error) {
            console.error('Error loading components:', error)
            return
        }
        
        console.log('Components loaded:', data)
        
        // Get the table body element
        const tableBody = document.getElementById('components-tbody')
        
        // Clear any existing content
        tableBody.innerHTML = ''
        
        // Add each component as a table row
        data.forEach(component => {
            const row = document.createElement('tr')
            row.innerHTML = `
                <td>${component.Drawing}</td>
                <td>${component.Component}</td>
                <td>${component.Unit}</td>
                `
            row.style.cursor = 'pointer'
            row.addEventListener('click', () => handleRowClick(component))
            tableBody.appendChild(row)
        })
        
    } catch (err) {
        console.error('Unexpected error:', err)
    }
}

// Load components when page loads
loadComponents()

// Function to handle row clicks
// Function to handle row clicks
function handleRowClick(component) {
    console.log('Clicked component:', component)
    
    // Update the details section
    const detailsContent = document.getElementById('details-content')
    detailsContent.innerHTML = `
        <h3>${component.Drawing} - ${component.Component}</h3>
        <p><strong>Unit:</strong> ${component.Unit}</p>
        <p><strong>Component ID:</strong> ${component.id}</p>
        <div id="readings-section">
            <h4>Readings</h4>
            <p>Loading readings...</p>
        </div>
    `
    
    // Actually call the function to load readings
    loadReadingsForComponent(component.id)
}

// Function to load readings for a specific component
async function loadReadingsForComponent(componentId) {
    try {
        console.log('Loading readings for component ID:', componentId)
        
        const { data, error } = await client
            .from('Readings')
            .select('*')
            .eq('component_id', componentId)
            .order('test_date', { ascending: false })
        
        if (error) {
            console.error('Error loading readings:', error)
            return
        }
        
        console.log('Readings loaded:', data)
        
        // Update the readings section
        // Update the readings section
    const readingsSection = document.getElementById('readings-section')

    if (data.length === 0) {
        readingsSection.innerHTML = `
            <h4>Readings</h4>
            <button onclick="showAddReadingForm(${componentId})" style="background: #008CBA; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">Add New Reading</button>
            <p>No readings found for this component.</p>
        `
    } else {
        let readingsHTML = `
            <h4>Readings</h4>
            <button onclick="showAddReadingForm(${componentId})" style="background: #008CBA; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 10px;">Add New Reading</button>
            <ul>
        `
        data.forEach(reading => {
            readingsHTML += `
                <li>
                    <strong>Date:</strong> ${reading.test_date} | 
                    <strong>Inspector:</strong> ${reading.inspector} | 
                    <strong>Value:</strong> ${reading.reading_value}
                    ${reading.notes ? ` | <strong>Notes:</strong> ${reading.notes}` : ''}
                </li>
            `
        })
        readingsHTML += '</ul>'
        readingsSection.innerHTML = readingsHTML
    }
        
    } catch (err) {
        console.error('Error loading readings:', err)
    }
}

// Function to show the add reading form
function showAddReadingForm(componentId) {
    const readingsSection = document.getElementById('readings-section')
    
    // Add the form HTML
    const formHTML = `
        <h4>Readings</h4>
        <div id="add-reading-form" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ccc; border-radius: 5px;">
            <h5>Add New Reading</h5>
            <form id="reading-form">
                <div style="margin-bottom: 10px;">
                    <label>Test Date:</label><br>
                    <input type="date" id="test-date" required style="width: 200px; padding: 5px;">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Inspector:</label><br>
                    <input type="text" id="inspector" required style="width: 200px; padding: 5px;" placeholder="Enter inspector name">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Reading Value:</label><br>
                    <input type="number" id="reading-value" step="0.1" required style="width: 200px; padding: 5px;" placeholder="Enter reading value">
                </div>
                <div style="margin-bottom: 10px;">
                    <label>Notes (optional):</label><br>
                    <textarea id="notes" style="width: 200px; padding: 5px; height: 60px;" placeholder="Enter any notes"></textarea>
                </div>
                <button type="submit" style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Add Reading</button>
                <button type="button" id="cancel-btn" style="background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button>
            </form>
        </div>
        <div id="readings-list"></div>
    `
    
    readingsSection.innerHTML = formHTML
    
    // Add event listeners
    document.getElementById('reading-form').addEventListener('submit', (e) => {
        e.preventDefault()
        addNewReading(componentId)
    })
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        loadReadingsForComponent(componentId) // Just reload the readings without form
    })
}

// Function to add a new reading
async function addNewReading(componentId) {
    try {
        const testDate = document.getElementById('test-date').value
        const inspector = document.getElementById('inspector').value
        const readingValue = document.getElementById('reading-value').value
        const notes = document.getElementById('notes').value
        
        console.log('Adding new reading for component:', componentId)
        
        const { data, error } = await client
            .from('Readings')
            .insert([{
                component_id: componentId,
                test_date: testDate,
                inspector: inspector,
                reading_value: parseFloat(readingValue),
                notes: notes || null
            }])
        
        if (error) {
            console.error('Error adding reading:', error)
            alert('Error adding reading: ' + error.message)
            return
        }
        
        console.log('Reading added successfully:', data)
        alert('Reading added successfully!')
        
        // Reload the readings to show the new one
        loadReadingsForComponent(componentId)
        
    } catch (err) {
        console.error('Unexpected error:', err)
        alert('Unexpected error occurred')
    }
}