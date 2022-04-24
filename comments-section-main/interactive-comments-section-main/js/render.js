console.log(data)

renderReplyForm = (element, btn='reply') => {
    const id = element.closest('ul').getAttribute('commentId')
    const form = document.createElement("form")
    const img = document.createElement("img")
    img.src = data.currentUser.image.webp
    form.appendChild(img)
    const textarea = document.createElement("textarea")
    textarea.setAttribute("name", "content")
    textarea.setAttribute("maxlength", "200")
    const userN = findCommentById(id).user.username
    textarea.value = `@${userN}  `
    form.setAttribute("onsubmit", `event.preventDefault(); saveNewComment(this, "${userN}")`)
    form.appendChild(textarea)
    const sub = document.createElement("input")
    sub.setAttribute("type", "submit")
    sub.setAttribute("value", btn)
    document.querySelectorAll('form:not(#newComment)').forEach(box => box.remove())
    form.appendChild(sub)
    const subOl = element.closest('ul').getElementsByTagName('ol')
    if (subOl.length > 0) {
        subOl[0].appendChild(form)
    } else {
        element.closest('ol').insertBefore(form, element.closest('ul').nextSibling)
    }
    textarea.focus()
}

renderNewComment = comment => {
    let ul = document.createElement("ul")
    ul.setAttribute("commentId", comment.id)
    let article = document.createElement("article")

    const divWithName = document.createElement("div")
    divWithName.classList.add("name")
    const imgWithPhoto = document.createElement("img")
    imgWithPhoto.src = comment.user.image.webp
    divWithName.appendChild(imgWithPhoto)
    divWithName.innerHTML += comment.user.username
    if (isCurrentUser(comment.user.username)) {divWithName.innerHTML += `<span class="you">you</span>`}
    article.appendChild(divWithName)

    const divWithTime = document.createElement("div")
    divWithTime.classList.add("time")
    divWithTime.innerHTML = comment.createdAt
    article.appendChild(divWithTime)

    const divWithPoints = document.createElement("div")
    divWithPoints.classList.add("points")
    const plusLink = document.createElement('a')
    plusLink.classList.add("plus")
    plusLink.href = '#'
    plusLink.setAttribute("onclick","changePoints(this)")
    plusLink.innerHTML = '+'
    const minusLink = document.createElement("a")
    minusLink.classList.add("minus")
    minusLink.href = '#'
    minusLink.setAttribute("onclick","changePoints(this)")
    minusLink.innerHTML = '-'
    const spanWithNumberOfPoints = document.createElement("span")
    spanWithNumberOfPoints.innerHTML = comment.score
    divWithPoints.prepend(spanWithNumberOfPoints)
    divWithPoints.prepend(plusLink)
    divWithPoints.appendChild(minusLink)
    article.appendChild(divWithPoints)

    const divWithAction = document.createElement("div")
    divWithAction.classList.add("action")
    divWithAction.innerHTML = isCurrentUser(comment.user.username) ?
        `<a href="#" class="delete" commentId="${comment.id}" onClick="delComment(this)">Delete</a> <a href="#" class="edit" commentId="${comment.id}" onClick="editComment(this)">Edit</a>` : 
        `<a href="#" class="reply" commentId="${comment.id}" onClick="renderReplyForm(this)">Reply</a>`
    article.appendChild(divWithAction)

    const divWithComment = document.createElement("div")
    divWithComment.classList.add("content")
    divWithComment.innerHTML = isCommentOrReply(comment)
    article.appendChild(divWithComment)

    ul.appendChild(article)
    if (typeof comment.replies != 'undefined') {
        let subComment = document.createElement("ol")
        comment.replies.forEach(comm => {
            subComment.appendChild(renderNewComment(comm))
        })
        ul.appendChild(subComment)
    }
    return ul
}

loadComments = () => {
    let ol = document.getElementById("comments")
    ol.innerHTML = ''
    data.comments.forEach(comment => ol.appendChild(renderNewComment(comment)))
}
loadComments()
document.querySelector("#newComment img").src = data.currentUser.image.webp

saveNewComment = (domForm, reply=0) => {
    const form = Object.fromEntries(new FormData(domForm))
    if ( form.content.substring(1, reply.length+1) === reply ) {
        form.content = form.content.substring(reply.length+1, form.content.length)
    }
    form.content = form.content.trim()
    if (form.content === '') {return}
    reply === 0 ? form.replies = [] : form.replyingTo = reply
    form.user = data.currentUser
    form.id = giveId(data.comments) + 1
    form.score = 0
    form.createdAt = "1 minute ago"
    if (domForm === document.getElementById("newComment")) {
        data.comments.push(form)
        document.getElementById("comments").appendChild(renderNewComment(form))
        document.querySelector("#newComment textarea").value = ''
    } else {
        const id = domForm.closest('ul').getAttribute('commentId')
        const [parentCommIndex, childCommIndex] = findCommentIndexById(id)
        const parentCommReplies = data.comments[parentCommIndex].replies
        childCommIndex > -1 ? parentCommReplies.splice(childCommIndex+1, 0, form) : parentCommReplies.push(form)
        domForm.after(renderNewComment(form))
        domForm.remove()
    }
    console.log(data.comments)
}

renderEditForm = content => {
    const editForm = document.createElement("form")
    const textarea = document.createElement("textarea")
    textarea.setAttribute("name", "content")
    textarea.setAttribute("maxlength", "200")
    textarea.value = content.content
    editForm.appendChild(textarea)
    const editBtn = document.createElement("input")
    editBtn.setAttribute("type", "submit")
    editBtn.setAttribute("value", 'update')
    editForm.appendChild(editBtn)
    editForm.setAttribute("onsubmit", `event.preventDefault(); saveEditComment(this)`)
    return editForm
}

editComment = element => {
    const id = element.closest('ul').getAttribute('commentId')
    const divWithContent = element.closest('article').getElementsByClassName('content')[0]
    const comment = findCommentById(id)
    divWithContent.innerHTML = ''
    divWithContent.appendChild(renderEditForm(comment))
}

saveEditComment = domForm => {
    const id = domForm.closest('ul').getAttribute('commentId')
    const form = Object.fromEntries(new FormData(domForm))
    form.content = form.content.trim()
    if (form.content === '') {return}
    const comment = findCommentById(id)
    comment.content = form.content
    const divWithComment = domForm.closest('div')
    divWithComment.classList.add("content")
    divWithComment.innerHTML = isCommentOrReply(comment)
    domForm.remove()
}

cancelDelComment = () => document.getElementsByTagName('dialog')[0].close()

let isDeleting
delComment = element => {
    isDeleting = element.getAttribute('commentId')
    document.getElementsByTagName('dialog')[0].showModal()
}

changePoints = element => {
    element.style.pointerEvents = 'none'
    const id = element.closest('ul').getAttribute('commentId')
    const operation = element.className
    const comment = findCommentById(id)
    comment.score = plusOrMinusOne(operation, comment.score)
    element.closest('.points').getElementsByTagName('span')[0].textContent = comment.score
}
