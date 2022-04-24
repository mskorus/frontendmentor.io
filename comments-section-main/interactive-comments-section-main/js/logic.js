isCurrentUser = (userName) => data.currentUser.username == userName

isCommentOrReply = (comment) => comment.replyingTo ?
    '<a href="#">@' + comment.replyingTo + '</a> ' + comment.content : comment.content

plusOrMinusOne = (operation, num) => operation === 'plus' ? num+1 : Math.max(num-1, 0)

checkNestingIndexesAndItSelf = (comment, index, id) => comment.id == id ? [index, null] : [index, comment.replies?.findIndex(comm => comm.id == id)]

findCommentIndexById = (id) => {
    let indexArr
    data.comments.some((c, i) => {
        indexArr = checkNestingIndexesAndItSelf(c, i, id)
        return (indexArr[0] > -1 && indexArr[1] == null) || (indexArr[1] > -1)
    })
    return indexArr
}

checkNestingCommentsAndItSelf = (comment, id) => comment.id == id ? comment : comment.replies?.find(el => el.id == id)

findCommentById = id => {
    let comment
    data.comments.some(ar => comment = checkNestingCommentsAndItSelf(ar, id))
    return comment
}

acceptDelComment = () => {
    const arrId = findCommentIndexById(isDeleting)
    arrId[1] > -1 && arrId[1] != null ? data.comments[arrId[0]].replies.splice(arrId[1], 1) : (arrId[0] > -1 ? data.comments.splice(arrId[0], 1) : '')
    isDeleting = null
    document.getElementsByTagName('dialog')[0].close()
    loadComments()
}

giveId = (commentArr) => commentArr.reduce((acc, comm) =>
    Math.max(acc, comm.replies?.reduce((max, comment) =>
        Math.max(max, comment.id), comm.id)), 0)
