// Generate admin dashboard HTML and blog content related function
async function getBlogContent(token) {
    try {
        // Fetch blog content from the server
        const response = await fetch(
            `/.netlify/functions/blog-admin?type=blog-data&token=${token}`
        )

        if (!response.ok) {
            throw new Error('Network response was not ok')
        }

        const raw = await response.json()
        const data = raw.data

        if (data && data.message === 'Success') {
            return data.data // Return the blog content data
        } else {
            console.error('Error getting blog content:', data.message)
            swal('Error getting blog content', data.message, 'error')
            return { message: 'Error getting blog content: ' + data.message }
        }
    } catch (e) {
        console.error('Error getting blog content:', e)
        swal('Error', 'Error getting blog content. Please try again\n' + e, 'error')
        return { message: 'Error getting blog content: ' + e.message }
    }
}

function generateSummary(text, sentenceCount = 3) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g); // Split text into sentences
    if (sentences && sentences.length > 0) {
        return sentences.slice(0, sentenceCount).join(' '); // Return first n sentences
    }
    return '';
}

function generateSummary(text, sentenceCount = 3) {
    const sentences = text.match(/[^\.!\?]+[\.!\?]+/g); // Split text into sentences
    if (sentences && sentences.length > 0) {
        return sentences.slice(0, sentenceCount).join(' '); // Return first n sentences
    }
    return '';
}

async function submitContent(token, data) {
    try {
        const response = await fetch('/.netlify/functions/blog-admin', {
            method: 'POST',
            body: JSON.stringify({ token: token, type: 'upload-blog', data }) // send as part of body, not URL
        })

        if (!response.ok) {
            throw new Error(`Error: ${response.status} - ${response.statusText}`)
        }

        const raw = await response.json()

        if (raw.message === 'Success') {
            raw.status = 'success'
            return raw
        } else {
            console.error('Error uploading blog content:', raw.message)
            swal('Error uploading blog content', raw.message, 'error')
            return {
                message: 'Error sending blog content: ' + raw.message,
                status: 'error'
            }
        }
    } catch (e) {
        console.error('Error uploading blog content:', e)
        swal(
            'Error',
            'Error uploading blog content. Please try again\n' + e,
            'error'
        )
        return {
            message: 'Error sending blog content: ' + e.message,
            status: 'error'
        }
    }
}

function generateContentCard(
    number,
    id,
    title,
    likes,
    date,
    showDetailCallback,
    statusContent,
    adjustContentCallback
) {
    try {
        // Find the original element
        const originalElement = document.querySelector('#example-content-panel')

        // Clone the element
        const clonedElement = originalElement.cloneNode(true)
        clonedElement.id = `content-panel-${id}`
        clonedElement.className = `services color-${number} animate-box content-panel`
        clonedElement.style.display = 'block'

        // Modify the cloned element
        clonedElement.querySelector('p').textContent = `ID: ${id} (${date})`
        clonedElement.querySelector('h3').textContent = title
        clonedElement.querySelector(
            'span'
        ).innerHTML = `${likes} <i class="icon-like"></i>`

        // Update the buttons' onclick attributes
        clonedElement
            .querySelector('#content-show-button')
            .setAttribute('onclick', showDetailCallback)
        const statusButton = clonedElement.querySelector('#content-status-button')
        const adjustButton = clonedElement.querySelector('#content-adjust-buttton')
        if (statusContent === 'PUBLISH') {
            statusButton.className = 'btn btn-danger'
            statusButton.innerHTML = 'Hide <i class="icon-delete2"></i>'
            // statusButton.setAttribute('onclick', statusContent);
        } else if (statusContent === 'HIDE') {
            statusButton.className = 'btn btn-success'
            statusButton.innerHTML = 'Show <i class="icon-eye"></i>'
            // statusButton.setAttribute('onclick', statusContent);
        } else if (statusContent === 'DRAFT') {
            statusButton.className = 'btn btn-info'
            statusButton.innerHTML = 'CONTINUE EDIT <i class="icon-upload"></i>'
            // statusButton.setAttribute('onclick', statusContent);
            adjustButton.style.display = 'none'
        } else {
            statusButton.className = 'btn btn-warning'
            statusButton.innerHTML = `${statusContent} <i class="icon-warning"></i>`
            statusButton.setAttribute('disabled', true)
        }
        adjustButton.setAttribute('onclick', adjustContentCallback)

        // Append the cloned element to the desired parent element
        document.getElementById('content-summary-show').appendChild(clonedElement)
    } catch (e) {
        console.error('Error generating content card:', e)
        swal(
            'Error',
            'Error generating content card. Please try again.\n' + e,
            'error'
        )
    }
}

let simplemde

async function generateAdminHTML(token) {
    if (!token && token !== localStorage.getItem('adminToken')) {
        return
    }

    try {
        const admin_dashboard = document.getElementById('admin-dashboard')
        admin_dashboard.innerHTML = `<!-- start:blog-admin-section-->
                    <section id="blog-admin" class="colorlib-about" data-section="blog-admin">
                        <div class="row colorlib-narrow-content">
                            <div class="col-md-12">
                                <div class="row animate-box blog-row">
                                    <h2 class="colorlib-heading blog-heading" style="margin-bottom:5%;">Blog Content
                                    </h2>

                                    <div class="form-group sidebyside">
                                        <label for="shows-count">Display:</label>
                                        <select class="form-control" id="shows-count">
                                            <option value="5">5</option>
                                            <option value="10">10</option>
                                            <option value="20">20</option>
                                        </select>
                                    </div>

                                    <!-- color max: 6 -->
                                    <div id="content-summary-show">
                                        <div class="services color-1 animate-box content-panel" style="margin-bottom:2%; display:None;"
                                            data-animate-effect="fadeInRight" id="example-content-panel">
                                            <p style="margin-bottom:2%">ID: </p>
                                            <h3>TITLE LONG ONE MEOW MEPW MEOW MAOW</h3>
                                            <div class="row" style="margin-left:0%">
                                                <span style="margin-right:2%">0 <i class="icon-like"></i></span>
                                                <button class="btn btn-primary" id="content-show-button" type="button"
                                                    onclick="showDetail()">Preview <i class="icon-book"></i></button>
                                                <button class="btn btn-danger" id="content-status-button" type="button"
                                                    onclick="hideContent()">Hide <i class="icon-delete2"></i></button>
                                                <button class="btn btn-warning" id="content-adjust-buttton"
                                                    type="button" onclick="adjustContent()">Adjust <i
                                                        class="icon-pencil"></i></button>
                                            </div>
                                        </div>
                                    </div>


                                    <nav aria-label="content summary show" style="left:20%;">
                                        <ul class="pagination justify-content-center">
                                            <li class="page-item">
                                                <a class="page-link disabled" href="#" aria-label="Previous">
                                                    <span aria-hidden="true">&laquo;</span>
                                                    <span class="sr-only">Previous</span>
                                                </a>
                                            </li>
                                            <li class="page-item active"><a class="page-link" href="#">1</a></li>
                                            <li class="page-item"><a class="page-link" href="#">2</a></li>
                                            <li class="page-item"><a class="page-link" href="#">3</a></li>

                                            <li class="page-item">
                                                <a class="page-link" href="#" aria-label="Next">
                                                    <span aria-hidden="true">&raquo;</span>
                                                    <span class="sr-only">Next</span>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>

                                </div>

                                <div class="row animate-box blog-row" id="editor-container">
                                    <hr class="hr solid" style="border-top: 0.01px solid #999" />

                                    <!-- Tips: Editor.md can auto append a '< textarea >'  tag -->
                                    <h2 class="colorlib-heading blog-heading" style="margin-bottom:5%;">Blog Editor
                                    </h2>
                                    <div class="form-group">
                                        <label for="editor-title">Content Title:</label>
                                        <input type="text" class="form-control" placeholder="Title" id="editor-title">
                                    </div>

                                    <div class="form-group">
                                        <label for="editor">Content Editor:</label>
                                        <textarea id="editor" style="display:none;">### Hello Editor.md !</textarea>
                                        <button class="btn btn-primary" id="editor-submit-buttton" type="button"
                                            >Submit <i class="icon-upload"></i></button>
                                    </div>

                                </div>
                            </div>
                        </div>


                    </section>
                    <!-- end:blog-admin-section -->;`
        admin_dashboard.style.display = 'block'

        simplemde = new SimpleMDE({
            element: document.getElementById('editor'),
            autofocus: true,
            autosave: {
                enabled: true,
                uniqueId: 'mde-test',
                delay: 1000
            },
            spellChecker: true
        })

        // number max 6
        const blogRawData = await getBlogContent(token)
        const index_pos = (blogRawData.length - 1).toString()
        const index_obj = blogRawData[index_pos]
        delete blogRawData[index_pos]
        console.log(index_obj)

        var c = 1
        for (const key in blogRawData) {
            if (blogRawData.hasOwnProperty(key)) {
                const item = blogRawData[key].data
                for (const a in item) {
                    generateContentCard(
                        (c % 6) + 1,
                        a,
                        item[a].TITLE,
                        item[a].LIKES,
                        item[a].DATE,
                        `showDetail(${JSON.stringify(item[a])})`,
                        item[a].STATUS,
                        `adjustContent(${JSON.stringify(item[a])})`
                    )
                    c++
                    // console.log(item[a]);
                }
            }
        }

        // Submit content button
        const submitButton = document.getElementById('editor-submit-buttton')
        const date = new Date()
        const day = date.getDate()
        const month = date.getMonth() + 1 // Months are zero-based
        const year = date.getFullYear()
        const formattedDate = `${day}-${month}-${year}`
        const doc_name = `${month}_${year}`
        console.log(formattedDate, doc_name, index_obj.data.ID)

        submitButton.addEventListener('click', async function () {
            const contentTitle = document.getElementById('editor-title')
            const contentText = simplemde.value()

            // Check for empty title or content
            if (!contentTitle.value || !contentText) {
                swal(
                    'Error',
                    'Please enter a title and content before submitting',
                    'error'
                )
                return
            }

            // Prepare content data
            var contentData = {
                id: index_obj.data.ID,
                content: {
                    TITLE: contentTitle.value,
                    CONTENT: contentText,
                    LIKES: 0,
                    STATUS: "PENDING",
                    DATE: formattedDate,
                    SUMMARY: generateSummary(contentText, 2),// Ensure formattedDate is defined
                },
                doc_name: doc_name
            }

            try {
                // Show confirmation dialog
                const value = await swal({
                    title: 'Publish this content?',
                    text: 'Title: ' + contentTitle.value,
                    icon: 'info',
                    buttons: {
                        cancel: 'Cancel',
                        publish: {
                            text: 'Publish!',
                            value: 'publish'
                        },
                        draft: {
                            text: 'Save as draft',
                            value: 'draft'
                        }
                    }
                })

                if (value === 'draft' || value === 'publish') {
                    contentData.content.STATUS = value.toUpperCase()
                    const submitResponse = await submitContent(token, contentData) // Await response from submitContent

                    if (submitResponse.status === 'error') {
                        throw new Error(
                            'Failed to upload content to database\n' + submitResponse.message
                        )
                    }

                    // Handle response based on status
                    switch (value) {
                        case 'draft':
                            simplemde.value('')
                            contentTitle.value = ''
                            swal(
                                'Saved',
                                'Your blog content has been saved as draft',
                                'info'
                            ).then(() => {
                                location.reload() // Reload the page after saving as draft
                            })
                            break
                        case 'publish':
                            simplemde.value('')
                            contentTitle.value = ''
                            swal(
                                'Uploaded!',
                                'Your blog content has been published',
                                'success'
                            ).then(() => {
                                location.reload() // Reload the page after publishing
                            })
                            break
                        default:
                            swal('Cancelled')
                    }
                } else {
                    swal('Cancelled')
                }
            } catch (e) {
                console.error('Error uploading content:', e)
                swal(
                    'Error',
                    'Error uploading content. Please try again.\n' + e.message,
                    'error'
                )
            }
        })

        runAnimateBox()
        console.log('Admin HTML generated successfully')
    } catch (e) {
        console.error('Error generate admin html:\n', e.stack)
        swal('Error', 'Error generate admin html. Please try again.\n' + e, 'error')
    }
}

function passwordPrompt(text) {
    /*creates a password-prompt instead of a normal prompt*/
    /* first the styling - could be made here or in a css-file. looks very silly now but its just a proof of concept so who cares */
    var width = 500
    var height = 100
    var pwprompt = document.createElement('div') //creates the div to be used as a prompt
    pwprompt.id = 'password_prompt' //gives the prompt an id - not used in my example but good for styling with css-file
    pwprompt.style.position = 'fixed' //make it fixed as we do not want to move it around
    pwprompt.style.left = '50%' //let it apear in the middle of the page
    pwprompt.style.top = '5%' //let it apear in the middle of the page
    pwprompt.style.border = '1px solid black' //give it a border
    pwprompt.style.padding = '16px' //give it some space
    pwprompt.style.background = 'white' //give it some background so its not transparent
    pwprompt.style.zIndex = 99999 //put it above everything else - just in case

    var pwtext = document.createElement('div') //create the div for the password-text
    pwtext.innerHTML = text //put inside the text
    pwprompt.appendChild(pwtext) //append the text-div to the password-prompt
    var pwinput = document.createElement('input') //creates the password-input
    pwinput.id = 'password_id' //give it some id - not really used in this example...
    pwinput.type = 'password' // makes the input of type password to not show plain-text
    pwprompt.appendChild(pwinput) //append it to password-prompt
    var pwokbutton = document.createElement('button') //the ok button
    pwokbutton.innerHTML = 'ok'
    var pwcancelb = document.createElement('button') //the cancel-button
    pwcancelb.innerHTML = 'cancel'
    pwprompt.appendChild(pwcancelb) //append cancel-button first
    pwprompt.appendChild(pwokbutton) //append the ok-button
    document.body.appendChild(pwprompt) //append the password-prompt so it gets visible
    pwinput.focus() //focus on the password-input-field so user does not need to click

    /*now comes the magic: create and return a promise*/
    return new Promise(function (resolve, reject) {
        pwprompt.addEventListener('click', function handleButtonClicks(e) {
            //lets handle the buttons
            if (e.target.tagName !== 'BUTTON') {
                return
            } //nothing to do - user clicked somewhere else
            pwprompt.removeEventListener('click', handleButtonClicks) //removes eventhandler on cancel or ok
            if (e.target === pwokbutton) {
                //click on ok-button
                resolve(pwinput.value) //return the value of the password
            } else {
                reject(new Error('User cancelled')) //return an error
            }
            document.body.removeChild(pwprompt) //as we are done clean up by removing the password-prompt
        })
        pwinput.addEventListener('keyup', function handleEnter(e) {
            //users dont like to click on buttons
            if (e.keyCode == 13) {
                //if user enters "enter"-key on password-field
                resolve(pwinput.value) //return password-value
                document.body.removeChild(pwprompt) //clean up by removing the password-prompt
            } else if (e.keyCode == 27) {
                //user enters "Escape" on password-field
                document.body.removeChild(pwprompt) //clean up the password-prompt
                reject(new Error('User cancelled')) //return an error
            }
        })
    })
}

// Function for blog summary and detail content view
function arrangeChildrenInColumns(parent_container_name, col_n) {
    const container = document.getElementById(parent_container_name)
    const children = Array.from(container.children)
    const rowClass = 'row'
    const colClass = 'col-md-4 animate-box' // Bootstrap class for 3 columns per row

    // Clear the container
    container.innerHTML = ''

    // Create rows and append children
    for (let i = 0; i < children.length; i += col_n) {
        const row = document.createElement('div')
        row.className = rowClass

        for (let j = i; j < i + 3 && j < children.length; j++) {
            children[j].className = colClass
            children[j].setAttribute(
                'data-animate-effect',
                j % 2 == 0 ? 'fadeInLeft' : 'fadeInRight'
            )
            row.appendChild(children[j])
        }
        container.appendChild(row)
    }
}

async function getBlogContent() {
    try {
        let blog_token = localStorage.getItem('blogToken')

        if (!blog_token) {
            const response = await fetch('/.netlify/functions/blog-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'blog-content'
                })
            })
            const data = await response.json()

            if (data.message === 'Success') {
                localStorage.setItem('blogToken', blog_token)
                localStorage.setItem('blogContent', JSON.stringify(data.data))
                return { data: data.data, status: 'success' }
            } else {
                throw new Error('Failed to fetch blog content')
            }

        }

        const response = await fetch('/.netlify/functions/blog-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'blog-content',
                token: blog_token,
            })
        })
        const data = await response.json()

        if (data.message === 'Loaded') {
            let blog_content = JSON.parse(localStorage.getItem('blogContent'))
            return { data: blog_content, status: 'success' }
        }


    } catch (e) {
        console.error('Error getting blog content:', e)
        swal('Error', 'Error getting blog content. Please try again\n' + e, 'error')
        return {
            message: 'Error getting blog content: ' + e, status: 'error'
        }
    }
}

async function blogView() {
    try {
        const blog_view = document.getElementById('blog-view')
        blog_view.style.display = 'block'

        arrangeChildrenInColumns('blog-summary-view', 3)

        // last run back animation
        runAnimateBox()
    } catch (e) {
        swal({
            title: 'Error',
            text: 'Catched error with Blog View, Please Try Again Later: ' + e,
            icon: 'error'
        }).then(() => {
            window.location.href = '/'
        })
    }
}

// Admin authentication
async function checkAdminAccess() {
    try {
        let token = localStorage.getItem('adminToken')

        // If token exists, validate it with the server
        if (token) {
            const response = await fetch(
                '/.netlify/functions/blog-admin?type=admin-auth&token=' + token
            )
            const data = await response.json()

            if (data.message === 'Authenticated') {
                // Allow access to the admin dashboard
                const adminHTML = await generateAdminHTML(token)
                return
            } else {
                // If the token is invalid or expired, remove it and continue to ask for password
                localStorage.removeItem('adminToken')
            }
        }

        // If no valid token, prompt for password
        const result = await passwordPrompt('Please enter admin password')

        if (!result) {
            swal({
                title: 'Error',
                text: 'No password entered!',
                icon: 'error'
            }).then(() => {
                window.location.href = '/blog?content=admin'
            })
        }

        // Send the password to the Netlify function for authentication
        const response = await fetch('/.netlify/functions/blog-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'admin-auth',
                password: result
            })
        })

        const data = await response.json()

        if (data.token) {
            // Store the JWT token in localStorage for future requests
            localStorage.setItem('adminToken', data.token)
            const adminHTML = await generateAdminHTML(data.token)
            return
        } else {
            // Authentication failed
            swal({
                title: 'Error',
                text: 'Authentication failed: ' + data.message,
                icon: 'error'
            }).then(() => {
                window.location.href = '/blog?content=admin'
            })
        }
    } catch (e) {
        console.error('Error during authentication:', e)
        swal({
            title: 'Error',
            text: 'Authentication error. Please try again.\n' + e,
            icon: 'error'
        }).then(() => {
            window.location.href = '/blog'
        })
    }
}

// editor content submit function
if (window.location.pathname === "/blog") {
    // Admin run code
    if (window.location.search.includes('content=admin')) {
        checkAdminAccess()
    }
    else {
        blogView()
    }
}



