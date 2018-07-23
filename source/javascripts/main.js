var EMAIL = "nikolay.hnatovskyi@gmail.com";
var commentsCount = 0;
var isEditModeEnabled = false;
var currentUser = {
    name: "Kurt Thompson",
    avatar: "http://api.randomuser.me/portraits/thumb/men/69.jpg"
}

function getCommentsList(count, offset) {
    var url  = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments";

    if (count !== undefined && offset !== undefined) {
        url += "?count=" + count + "&offset=" + offset;
    } else if (count !== undefined) {
        url += "?count=" + count;
    } else if (offset !== undefined) {
        url += "?offset=" + offset;
    }

    return fetch(url).then(function(response) {
        return response.json();
    })
}

getCommentsList().then(
    result => renderCommentList(result),
    error => console.log(error)
);

function getSingleComment(id) {
    return new Promise(function(resolve, reject) {
        var url  = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/";
        var xhr  = new XMLHttpRequest()
        xhr.open('GET', url + id, true)
        xhr.onload = function () {
            var result = JSON.parse(xhr.responseText);
            if (xhr.readyState == 4 && xhr.status == "200") {
                console.log(result);
                resolve(this.response);
            } else {
                console.error(result);
                var error = new Error(this.statusText);
                error.code = this.status;
                reject(error);
            }
        }

        xhr.onerror = function() {
            reject(new Error("Network Error"));
        };

        xhr.send(null);
    });
}
//getSingleComment(4141)

function newComment(content, parent) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments";

    if (content !== undefined && parent !== undefined) {
        url += "?content=" + content + "&parent=" + parent;
    } else if (content !== undefined) {
        url += "?content=" + content;
    } else if (content === undefined) {
        console.log("Please, enter the message!");
    }

    return fetch(url, {method: 'POST'}).then(function(response) {
        return response.json();
    })
}

function editComment(id, content) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/" + id;

    if (content !== undefined) {
        url += "?content=" + content;
    } else {
        return;
    }

    return fetch(url, {method: 'PUT'}).then(function(response) {
        return response.json();
    })
}

function deleteComment(id) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/" + id;
    fetch(url, {method: 'DELETE'});
}

/* Rendering */
$(".comment_leave").find("img").attr("src", currentUser.avatar);

function renderCommentList(result) {
    var html = "";
    var commentsArr = [...result];
    var dataRegExp = /[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/;
    var timeRegExp = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;

    commentsArr.forEach(comment => {
        commentsCount++;
        html += `
        <div class="comment">
            <div class="avatar">
                <img src="${comment.author.avatar}" alt="avatar">
            </div>
            <div class="comment__body">
                <div class="comment__meta">
                    <span class="comment__author">
                        ${comment.author.name}
                    </span>
                    <span class="comment__date">
                        <i class="fa fa-clock-o" aria-hidden="true"></i>
                        <span>${comment.created_at.match(dataRegExp)[0]}</span> at 
                        <span>${comment.created_at.match(timeRegExp)[0]}</span>
                    </span>
                </div>
                <div class="comment__text">
                    ${comment.content}
                </div>
                <div class="comment__actions">
                    <button onclick="toggleCommentForm(event); isEditMode(event);">
                        <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                    </button>
                    <button onclick="deleteCurrentComment(event, ${comment.id})">
                        <i class="fa fa-times" aria-hidden="true"></i> Delete
                    </button>
                    <button onclick="toggleCommentForm(event)">
                        <i class="fa fa-reply" aria-hidden="true"></i>Reply
                    </button>
                </div>
                <div class="comment__form">
                    <div class="comment__form-header">
                        <span class="reply-to"><i class="fa fa-reply" aria-hidden="true"></i> ${comment.author.name}</span>
                        <button class="cancel" onclick="toggleCommentForm(event)">
                            <i class="fa fa-times" aria-hidden="true"></i> Cancel
                        </button>
                    </div>
                    <form action="">
                        <textarea placeholder="Your Message" name="" id="" cols="30" rows="6"></textarea>
                        <input class="btn" type="button" value="Send" onclick="formButtonAction(event, ${comment.id}, 'answer')">
                    </form>
                </div>
                <div class="comment__answers">`;
                    
                comment.children.forEach((item) => {
                    html += `
                    <div class="comment comment_children">
                        <div class="avatar">
                            <img src="${item.author.avatar}" alt="avatar">
                        </div>
                        <div class="comment__body">
                            <div class="comment__meta">
                                <span class="comment__author">
                                    ${item.author.name}
                                </span>
                                <span class="comment__reply-to">
                                    <i class="fa fa-reply" aria-hidden="true"></i> ${comment.author.name}
                                </span>
                                <span class="comment__date">
                                    <i class="fa fa-clock-o" aria-hidden="true"></i>
                                    <span>${item.created_at.match(dataRegExp)[0]}</span> at 
                                    <span>${item.created_at.match(timeRegExp)[0]}</span>
                                </span>
                            </div>
                            <div class="comment__text">
                                ${item.content}
                            </div>
                        </div>
                    </div>`
                });
                
                html += `</div>
            </div>
        </div>`;
    });
    document.getElementById("comment-list").innerHTML += html;
}

function toggleCommentForm(event) {
    isEditModeEnabled = false;
    var target = $(event.target);
    var form = target.parents(".comment__body").find(".comment__form");
    var textarea = target.parents(".comment__body").find("textarea");

    if (!form.hasClass("comment__form_opened")) {
        form.addClass("comment__form_opened");
    } else {
        form.removeClass("comment__form_opened");
        textarea.val("");
    }
}

function sendComment(event, parentID, mode) {
    var target = $(event.target);
    var textarea = target.parent("form").find("textarea");
    var message = textarea.val();

    switch (mode) {
        case 'answer':
            newComment(message, parentID);
            showNewAnswer(event);
            toggleCommentForm(event);
            textarea.val("");
            break;
        case 'comment':
            newComment(message)
                .then(
                    response => {
                        showNewComment(event);
                        textarea.val("");
                    },
                    error => console.log(error)
                )
            break;
    }
    isEditModeEnabled = false;
}

function deleteCurrentComment(event, id) {
    var target = $(event.target);
    var comment = target.parents(".comment");
    comment.remove();

    deleteComment(id);
}

function loadMoreComments(event) {
    var numberOfCommentsToShow = 5;
    var target = $(event.target);

    getCommentsList(numberOfCommentsToShow, commentsCount).then(
        result => renderCommentList(result),
        error => console.log(error)
    );

    var url  = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments?count=99999";
    var xhr  = new XMLHttpRequest()
    xhr.open('GET', url, false)
    xhr.onload = function () {
        var result = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            if(commentsCount >= result.length - numberOfCommentsToShow) {
                target.parent(".load-more").css("visibility", "hidden");
            }
        } else {
            console.error(result);
        }
    }
    xhr.send(null);
}

function editCurrentComment(event, id) {
    var target = $(event.target);
    var textarea = target.parent("form").find("textarea");
    var message = textarea.val();
    editComment(id, message);
}

function isEditMode(event) {
    isEditModeEnabled = true;
    var target = $(event.target);
    var textarea = target.parents(".comment__body").find("textarea");
    var text = target.parents(".comment__body").find(".comment__text").first().text();
    textarea.val(text.trim());
}

function formButtonAction(event, id, mode) {
    if (!isEditModeEnabled) {
        sendComment(event, id, mode);
    } else {
        editCurrentComment(event, id);
        var target = $(event.target);
        var textElem = target.parents(".comment__body").find(".comment__text").first();
        var textarea = target.parents(".comment__body").find("textarea");
        textElem.text(textarea.val());
        textarea.val("");
    }
}

function showNewAnswer(event) {
    var target = $(event.target);
    var textarea = target.parent("form").find("textarea");
    var message = textarea.val();
    var answersContainer = target.parents(".comment__body").find(".comment__answers");
    var authorName = target.parents(".comment:not(.comment_children)").find(".comment__meta .comment__author").first().text();

    var html = `<div class="comment comment_children">
        <div class="avatar">
            <img src="${currentUser.avatar}" alt="avatar">
        </div>
        <div class="comment__body">
            <div class="comment__meta">
                <span class="comment__author">
                    ${currentUser.name}
                </span>
                <span class="comment__reply-to">
                    <i class="fa fa-reply" aria-hidden="true"></i> ${authorName}
                </span>
                <span class="comment__date">
                    <i class="fa fa-clock-o" aria-hidden="true"></i>
                    <span>${getCurrentDate()}</span> at 
                    <span>${getCurrentTime()}</span>
                </span>
            </div>
            <div class="comment__text">
                ${message}
            </div>
        </div>
    </div>`;

    answersContainer.append(html);
}

function showNewComment(event) {
    var html = "";
    var target = $(event.target);
    var textarea = target.parent("form").find("textarea");
    var message = textarea.val();

    getCommentsList(1).then(
        result => {
            html = `
                <div class="comment">
                    <div class="avatar">
                        <img src="${currentUser.avatar}" alt="avatar">
                    </div>
                    <div class="comment__body">
                        <div class="comment__meta">
                            <span class="comment__author">
                                ${currentUser.name}
                            </span>
                            <span class="comment__date">
                                <i class="fa fa-clock-o" aria-hidden="true"></i>
                                <span>${getCurrentDate()}</span> at 
                                <span>${getCurrentTime()}</span>
                            </span>
                        </div>
                        <div class="comment__text">
                            ${message}
                        </div>
                        <div class="comment__actions">
                            <button onclick="toggleCommentForm(event); isEditMode(event);">
                                <i class="fa fa-pencil-square-o" aria-hidden="true"></i> Edit
                            </button>
                            <button onclick="deleteCurrentComment(event, ${result[0].id})">
                                <i class="fa fa-times" aria-hidden="true"></i> Delete
                            </button>
                            <button onclick="toggleCommentForm(event)">
                                <i class="fa fa-reply" aria-hidden="true"></i>Reply
                            </button>
                        </div>
                        <div class="comment__form">
                            <div class="comment__form-header">
                                <span class="reply-to"><i class="fa fa-reply" aria-hidden="true"></i> Kurt Thompson</span>
                                <button class="cancel" onclick="toggleCommentForm(event)">
                                    <i class="fa fa-times" aria-hidden="true"></i> Cancel
                                </button>
                            </div>
                            <form action="">
                                <textarea placeholder="Your Message" name="" id="" cols="30" rows="6"></textarea>
                                <input class="btn" type="button" value="Send" onclick="formButtonAction(event, ${result[0].id}, 'answer')">
                            </form>
                        </div>
                        <div class="comment__answers"></div>
                    </div>
                </div>
            `;
        
            $("#comment-list").prepend(html);
        },
        error => console.log(error)
    );
}

function setCommentsNumber() {
    getCommentsList(99999).then(
        result => $(".comments-number").text(result.length),
        error => console.log(error)
    );
}

setCommentsNumber();

//helpers
function getCurrentDate() {
    var now = new Date();
    var formatedDate = formatDate(now);
    return formatedDate;
}

function formatDate(date) {
    var dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    var mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    var yy = date.getFullYear();

    return yy + '-' + mm + '-' + dd;
}

function getCurrentTime() {
    var hours = 3, minutes = 9;
    var now = new Date(Date.now());
    var formatted = now.getHours() - hours + ":" + (now.getMinutes() + minutes);
    return formatted;
}
