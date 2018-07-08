var EMAIL = "nikolay.hnatovskyi@gmail.com";
var commentsCount = 0;

function getCommentsList(count, offset) {
    var url  = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments";

    if(count !== undefined && offset !== undefined) {
        url += "?count=" + count + "&offset=" + offset;
    } else if (count !== undefined) {
        url += "?count=" + count;
    } else if(offset !== undefined) {
        url += "?offset=" + offset;
    }

    var xhr  = new XMLHttpRequest()
    xhr.open('GET', url, true)
    xhr.onload = function () {
        var result = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            renderCommentList(result);
            console.log(result);
        } else {
            console.error(result);
        }
    }
    xhr.send(null);
}

getCommentsList();
// getCommentsList();
// getCommentsList(null, 3);
// getCommentsList(2);

function getSingleComment(id) {
    var url  = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/";
    var xhr  = new XMLHttpRequest()
    xhr.open('GET', url + id, true)
    xhr.onload = function () {
        var result = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            console.log(result);
        } else {
            console.error(result);
        }
    }
    xhr.send(null);
}
//getSingleComment(4141)

function newComment(content, parent) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments";

    if(content !== undefined && parent !== undefined) {
        url += "?content=" + content + "&parent=" + parent;
    } else if (content !== undefined) {
        url += "?content=" + content;
    } else if(content === undefined) {
        console.log("Please, enter the message!");
    }


    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = function () {
        var result = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "201") {
            console.log(result, url);
        } else {
            console.error(result);
        }
    }
    xhr.send(null);
}
//newComment("text ", 4141);

function editComment(id, content) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/" + id;

    if (content !== undefined) {
        url += "?content=" + content;
    } else {
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader('Content-type','application/json; charset=utf-8');
    xhr.onload = function () {
        var result = JSON.parse(xhr.responseText);
        if (xhr.readyState == 4 && xhr.status == "200") {
            console.log(result);
        } else {
            console.error(result);
        }
    }
    xhr.send(null);   
}
// editComment(4150, "12345");

function deleteComment(id) {
    var url = "http://frontend-test.pingbull.com/pages/" + EMAIL + "/comments/" + id;
    var xhr = new XMLHttpRequest();
    xhr.open("DELETE", url, true);
    xhr.send(null); 
}

// deleteComment(4148);


/* Rendering */

function renderCommentList(result) {
    var html = "";
    var commentsArr = Array.from(result);
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
                    <button>
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
                        <input class="btn" type="button" value="Send" onclick="sendComment(event, ${comment.id})">
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
    var target = $(event.target);
    var form = target.parents(".comment__body").find(".comment__form");

    if(!form.hasClass("comment__form_opened")) {
        form.addClass("comment__form_opened");
    } else {
        form.removeClass("comment__form_opened");
    }
}

function sendComment(event, parentID) {
    var target = $(event.target);
    var message = target.parent("form").find("textarea").val();
    var answersContainer = target.parents(".comment__body").find(".comment__answers");
    newComment(message, parentID);
}

function deleteCurrentComment(event, id) {
    var target = $(event.target);
    var comment = target.parents(".comment");
    comment.remove();

    deleteComment(id);
}

function loadMoreComments(event) {
    var target = $(event.target);

    getCommentsList(5, commentsCount);
    
    if(commentsCount % 5 > 0) {
        target.parent(".load-more").css("visibility", "hidden");
    }
}































// var Model = {

//     countPushImg : 0, 

//     init : function () {
//         this.events();
//         this.getCommentsList();
//     },

//     events : function () {
//         this.actionsBtn1();
//         this.actionsBtn2();
//     },

//     actionsBtn1 : function () {
//         $('btn').on('click', function () {
//            Model.countPushImg++;
//         });
//     },

//     actionsBtn2 : function () {
//         $('btn').on('click', function () {

//         });
//     },

//     getCommentsList : function () {
        
        
//     }
// }

// Model.init();





