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

function handleRowClick(component) {
    console.log('Clicked component:', component)
    
    // Update the main PDF section
    const pdfMainContent = document.getElementById('pdf-main-content')
    if (component.drawing_pdf_url) {
        pdfMainContent.innerHTML = `
            <div class="component-info-banner">
                <h3>${component.Drawing} - ${component.Component} (${component.Unit})</h3>
            </div>
            <iframe src="${component.drawing_pdf_url}" class="pdf-main-viewer"></iframe>
            <div class="pdf-upload-main" style="margin-top: 1rem;">
                <button onclick="showPDFUpload(${component.id})" class="btn btn-warning">Replace PDF</button>
            </div>
        `
    } else {
        pdfMainContent.innerHTML = `
            <div class="component-info-banner">
                <h3>${component.Drawing} - ${component.Component} (${component.Unit})</h3>
            </div>
            <div class="pdf-upload-main">
                <p style="color: var(--dark-gray); margin-bottom: 1.5rem;">No technical drawing available for this component.</p>
                <button onclick="showPDFUpload(${component.id})" class="btn btn-primary">Upload PDF</button>
            </div>
        `
    }
    
    // Update the component details section (without PDF info)
    const detailsContent = document.getElementById('details-content')
    detailsContent.innerHTML = `
        <h3>Component Information</h3>
        <p><strong>Drawing:</strong> ${component.Drawing}</p>
        <p><strong>Component:</strong> ${component.Component}</p>
        <p><strong>Unit:</strong> ${component.Unit}</p>
        <p><strong>Component ID:</strong> ${component.id}</p>
        
        <div id="readings-section">
            <h4>Readings</h4>
            <p>Loading readings...</p>
        </div>
    `
    
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
        <button onclick="showAddReadingForm(${componentId})" class="btn btn-primary" style="margin-bottom: 10px;">Add New Reading</button>
        <p>No readings found for this component.</p>
    `
} else {
    let readingsHTML = `
        <h4>Readings</h4>
        <button onclick="showAddReadingForm(${componentId})" class="btn btn-primary" style="margin-bottom: 10px;">Add New Reading</button>
        <div class="readings-list">
    `
    data.forEach(reading => {
        readingsHTML += `
            <div class="reading-item">
                <div class="reading-info">
                    <strong>Date:</strong> ${reading.test_date} | 
                    <strong>Inspector:</strong> ${reading.inspector} | 
                    <strong>Value:</strong> ${reading.reading_value}
                    ${reading.notes ? ` | <strong>Notes:</strong> ${reading.notes}` : ''}
                </div>
                <div class="reading-actions">
                    <button onclick="editReading(${reading.id}, ${componentId})" class="btn btn-warning">
                        Edit
                    </button>
                    <button onclick="deleteReading(${reading.id}, ${componentId})" class="btn btn-danger">
                        Delete
                    </button>
                </div>
            </div>
        `
    })
    readingsHTML += '</div>'
    readingsSection.innerHTML = readingsHTML
}
        
    } catch (err) {
        console.error('Error loading readings:', err)
    }
}

// Function to show the add reading form
function showAddReadingForm(componentId) {
    const readingsSection = document.getElementById('readings-section')
    
    const formHTML = `
        <h4>Readings</h4>
        <div class="form-container">
            <h5>Add New Reading</h5>
            <form id="reading-form">
                <div class="form-group">
                    <label for="test-date">Test Date:</label>
                    <input type="date" id="test-date" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="inspector">Inspector:</label>
                    <input type="text" id="inspector" class="form-control" required placeholder="Enter inspector name">
                </div>
                <div class="form-group">
                    <label for="reading-value">Reading Value:</label>
                    <input type="number" id="reading-value" class="form-control" step="0.1" required placeholder="Enter reading value">
                </div>
                <div class="form-group">
                    <label for="notes">Notes (optional):</label>
                    <textarea id="notes" class="form-control" rows="3" placeholder="Enter any notes"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">Add Reading</button>
                <button type="button" id="cancel-btn" class="btn btn-danger" style="margin-left: 10px;">Cancel</button>
            </form>
        </div>
        <div id="readings-list"></div>
    `
    
    readingsSection.innerHTML = formHTML
    
    // Add event listeners (same as before)
    document.getElementById('reading-form').addEventListener('submit', (e) => {
        e.preventDefault()
        addNewReading(componentId)
    })
    
    document.getElementById('cancel-btn').addEventListener('click', () => {
        loadReadingsForComponent(componentId)
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

// Function to delete a reading
async function deleteReading(readingId, componentId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this reading? This action cannot be undone.')) {
        return
    }
    
    try {
        console.log('Deleting reading ID:', readingId)
        
        const { error } = await client
            .from('Readings')
            .delete()
            .eq('id', readingId)
        
        if (error) {
            console.error('Error deleting reading:', error)
            alert('Error deleting reading: ' + error.message)
            return
        }
        
        console.log('Reading deleted successfully')
        alert('Reading deleted successfully!')
        
        // Reload the readings to refresh the display
        loadReadingsForComponent(componentId)
        
    } catch (err) {
        console.error('Unexpected error:', err)
        alert('Unexpected error occurred')
    }
}

// Function to show edit form for a reading
async function editReading(readingId, componentId) {
    try {
        console.log('Editing reading ID:', readingId)
        
        // First, get the current reading data
        const { data, error } = await client
            .from('Readings')
            .select('*')
            .eq('id', readingId)
            .single()
        
        if (error) {
            console.error('Error fetching reading:', error)
            return
        }
        
        const reading = data
        console.log('Current reading data:', reading)
        
        // Create edit form
        const readingsSection = document.getElementById('readings-section')
        readingsSection.innerHTML = `
            <h4>Readings</h4>
            <div id="edit-reading-form" style="margin-bottom: 20px; padding: 15px; border: 2px solid #FF9800; border-radius: 5px; background-color: #FFF3E0;">
                <h5>Edit Reading</h5>
                <form id="edit-form">
                    <div style="margin-bottom: 10px;">
                        <label>Test Date:</label><br>
                        <input type="date" id="edit-test-date" value="${reading.test_date}" required style="width: 200px; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Inspector:</label><br>
                        <input type="text" id="edit-inspector" value="${reading.inspector}" required style="width: 200px; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Reading Value:</label><br>
                        <input type="number" id="edit-reading-value" value="${reading.reading_value}" step="0.1" required style="width: 200px; padding: 5px;">
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label>Notes (optional):</label><br>
                        <textarea id="edit-notes" style="width: 200px; padding: 5px; height: 60px;">${reading.notes || ''}</textarea>
                    </div>
                    <button type="submit" style="background: #4CAF50; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button>
                    <button type="button" id="cancel-edit-btn" style="background: #f44336; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Cancel</button>
                </form>
            </div>
        `
        
        // Add event listeners
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault()
            updateReading(readingId, componentId)
        })
        
        document.getElementById('cancel-edit-btn').addEventListener('click', () => {
            loadReadingsForComponent(componentId) // Cancel and reload
        })
        
    } catch (err) {
        console.error('Error setting up edit form:', err)
    }
}

// Function to update a reading
async function updateReading(readingId, componentId) {
    try {
        const testDate = document.getElementById('edit-test-date').value
        const inspector = document.getElementById('edit-inspector').value
        const readingValue = document.getElementById('edit-reading-value').value
        const notes = document.getElementById('edit-notes').value
        
        console.log('Updating reading ID:', readingId)
        
        const { error } = await client
            .from('Readings')
            .update({
                test_date: testDate,
                inspector: inspector,
                reading_value: parseFloat(readingValue),
                notes: notes || null
            })
            .eq('id', readingId)
        
        if (error) {
            console.error('Error updating reading:', error)
            alert('Error updating reading: ' + error.message)
            return
        }
        
        console.log('Reading updated successfully')
        alert('Reading updated successfully!')
        
        // Reload the readings to show the updated data
        loadReadingsForComponent(componentId)
        
    } catch (err) {
        console.error('Unexpected error:', err)
        alert('Unexpected error occurred')
    }
}

// Function to show PDF upload form
function showPDFUpload(componentId) {
    const pdfMainContent = document.getElementById('pdf-main-content')
    
    pdfMainContent.innerHTML = `
        <h2>Upload Technical Drawing</h2>
        <div class="form-container">
            <form id="pdf-upload-form">
                <div class="form-group">
                    <label for="pdf-file">Select PDF File:</label>
                    <input type="file" id="pdf-file" class="form-control" accept=".pdf" required>
                </div>
                <div style="text-align: center;">
                    <button type="submit" class="btn btn-primary">Upload PDF</button>
                    <button type="button" onclick="location.reload()" class="btn btn-danger" style="margin-left: 10px;">Cancel</button>
                </div>
            </form>
        </div>
        <div id="upload-progress" style="margin-top: 10px; display: none;">
            <div style="background: #f0f0f0; border-radius: 4px; padding: 8px;">
                <div id="progress-bar" style="background: var(--primary-green); height: 20px; border-radius: 4px; width: 0%; transition: width 0.3s;"></div>
            </div>
            <p id="progress-text">Uploading...</p>
        </div>
    `
    
    // Add form submission handler
    document.getElementById('pdf-upload-form').addEventListener('submit', (e) => {
        e.preventDefault()
        uploadPDF(componentId)
    })
}

// Function to upload PDF to Supabase Storage
// Function to upload PDF to Supabase Storage
async function uploadPDF(componentId) {
    try {
        const fileInput = document.getElementById('pdf-file')
        const file = fileInput.files[0]
        
        if (!file) {
            alert('Please select a PDF file')
            return
        }
        
        console.log('Uploading PDF for component:', componentId)
        
        // Show progress
        document.getElementById('upload-progress').style.display = 'block'
        
        // Create unique filename
        const fileName = `component_${componentId}_${Date.now()}.pdf`
        
        // Upload to Supabase Storage
        const { data: uploadData, error: uploadError } = await client.storage
            .from('pdfs')
            .upload(fileName, file)
        
        if (uploadError) {
            console.error('Upload error:', uploadError)
            alert('Error uploading PDF: ' + uploadError.message)
            return
        }
        
        console.log('File uploaded successfully:', uploadData)
        
        // Get the public URL
        const { data: urlData } = client.storage
            .from('pdfs')
            .getPublicUrl(fileName)
        
        const pdfUrl = urlData.publicUrl
        console.log('PDF URL:', pdfUrl)
        
        // Update the component record with the PDF URL
        const { error: updateError } = await client
            .from('Component Table')
            .update({ drawing_pdf_url: pdfUrl })
            .eq('id', componentId)
        
        if (updateError) {
            console.error('Error updating component:', updateError)
            alert('Error saving PDF URL: ' + updateError.message)
            return
        }
        
        alert('PDF uploaded successfully!')
        
        // Instead of reloading the page, refresh the current component display
        // First get the updated component data
        const { data: componentData, error: fetchError } = await client
            .from('Component Table')
            .select('*')
            .eq('id', componentId)
            .single()
        
        if (fetchError) {
            console.error('Error fetching updated component:', fetchError)
            location.reload() // fallback to page reload
            return
        }
        
        // Refresh the component display with updated data
        handleRowClick(componentData)
        
    } catch (err) {
        console.error('Unexpected error:', err)
        alert('Unexpected error occurred')
    }
}