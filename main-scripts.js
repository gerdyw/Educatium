$(document).ready(function(){
    var user;
    var comments_builder;
    var current_solution;

    user = contentData.solutions[0];
    build_navs(contentData.solutions);
    build_chat_dropdown(contentData.solutions);
    let comments = contentData.comments;
    comments_builder = ((comments) => {
        return function(solution) {
            let sid = solution.id;
            let top_levels = comments.filter(c => c.sid == sid && c.replyid == null);
            let replies = comments.filter(c => c.sid == sid && c.replyid != null);
            top_levels.forEach(t => {
                t.replies = replies.filter(r => r.replyid == t.cid);
                t.replies.sort((a, b) => (new Date(a.date)) - (new Date(b.date)));
            });
            return top_levels.map(t => build_comment(t));
        }
    })(comments);
    activate_solution(user);
    let cids = contentData.comments.map(c => c.cid);
    let _cid = cids.reduce((a, c) => c > a ? c : a) + 1;
    setTimeout(() => {
        let _sid = 1;
        let _replyid = null;
        let cids = contentData.comments.map(c => c.cid);
        let _cid = cids.reduce((a, c) => c > a ? c : a) + 1;
        let _date = format_date(new Date());
        let _name = "Attila";
        let _text = "But really what's going on in the painting?";
        let _current = true;
        let comment = {
            cid: _cid,
            replyid: _replyid,
            sid: _sid,
            name: _name,
            date: _date,
            text: _text,
            current: _current
        }
        contentData.comments.push(comment);
    }, 5000);
    setInterval(() => check_notifications(), 500);
    

    
    function activate_solution(solution) {
        current_solution = solution;
        solution.seen = true;
        $(".sol-nav").removeClass("active");
        $("#nav-pill-" + solution.id + " a").addClass("active");
        build_solution_dropdown(contentData.solutions);
        $("#solution-dropdown-button").text(solution.name);
        $("#solution-dropdown-button").append((contentData.solutions.map(s => s.seen).indexOf(false) > -1)
                                                            ? "&nbsp; <span id='new-notification' class='badge badge-pill badge-info'>new</span>"
                                                            : "");
        $("#post-date").text("Last modified " + solution.last_modified);
        $("#solution").html(solution.solution_html + "<br>").append($("<span></span>", {
            class: "font-weight-light text-right w-100"
        }));
        $("#solution-date").text("Last modified: " + solution.last_modified);
        $("#solution").data("sid", solution.id);
        const sticky = build_sticky(solution);
        if (!sticky) $("#stickied").css("display", "none");
        else {
            $("#stickied").html(sticky);
            $("#stickied").css("display", "initial");
        }
        $("#peer-feedback").html("");
        comments_builder(solution).forEach(c => $("#peer-feedback").append(c));
        $("#dropdown-" + solution.id).addClass("active");
        contentData.comments.forEach(c => {
            if (c.sid == solution.id) c.current = false;
        });
        if (solution.name == user.name) $("#edit-solution").removeClass("hidden"); 
        else $("#edit-solution").addClass("hidden");
        check_notifications();
        $("#solution-title").text((solution == user) ? "Your solution" : solution.name + "'s solution");
    }
    
    function build_navs(solutions) {
        solutions.forEach(s => {
            let pill = $("<li></li>", {
                id: "nav-pill-" + s.id,
                class: "nav-item nav-pill"
            });
            pill.html($("<a></a>", {
                class: "nav-link sol-nav",
                href: "#",
                text: s.name,
                click: function() {
                    activate_solution(s);
                }
            }));
            $("#solution-nav-pills").append(pill);
        });
    }
    
    function build_comment(jcomment) {
        var comment = $("<div></div>", {
            class: "media border p-3 mt-3",
            id: "comment-" + jcomment.cid
        });
        
        var comment_body = $("<div></div>")
            .addClass("media-body w-100");
        var heading = $("<h5></h5>")
            .addClass("media-heading")
            .html(jcomment.name +" <small><i>Posted " + jcomment.date + "</i></small>");
        comment_body.append(heading);
        
        let comment_p = $("<p>" + jcomment.text + " <br></p>");
        
        let comment_link = $("<a href='#' data-cid='" + jcomment.cid + "'>Reply</a>");
        comment_link.on("click", () => {
            if (!comment_link.hasClass("l-active")) {
                comment_link.addClass("l-active");
                comment_link.html("Cancel");
            } else {
                comment_link.removeClass("l-active");
                comment_link.html("Reply");
            }
            
            $("#comment").focus();
        });
//        if (jcomment.replyid == null) 
        comment_p.append(comment_link);
        
        comment_body.append(comment_p);
        
        var replies;
        
        contentData.comments.filter(c => c.replyid == jcomment.cid).forEach(r => comment_body.append(build_comment(r)));
        
        comment.append(comment_body);
        
        return comment;
    }
    
    function build_sticky(jsolution) {
        if (jsolution.stickied == "") return null;
        var sticky = $("<div></div>", {
            class: "media",
            id: "sticky-" + jsolution.sid
        });
        var sticky_body = $("<div/>", {
            class: "media-body",
            html: "<h5>Stickied by " + jsolution.name +  "</h5>" + 
                "<p class='mb-0'>" + jsolution.stickied + "</p>"
        });
        sticky.append(sticky_body);
        return sticky;
    }
    
    function build_chat_dropdown(solutions) {
        solutions.forEach(s => {
            if (s.id != 0) $("#chat-dropdown").append($("<a></a>", {
                class: "dropdown-item",
                href: "#",
                text: s.name
            }));
        });
    }
    
    function build_solution_dropdown(solutions) {
        $("#solution-dropdown").html("");
        solutions.forEach(s => {
            $("#solution-dropdown").append($("<a></a>", {
                id: "dropdown-" + s.id,
                class: "dropdown-item",
                href: "#",
                html: s.name + (!s.seen ? "&nbsp;<span class='badge badge-pill badge-info'>new</span>" : ""),
                click: function() {
                    activate_solution(s);
                }
            }));
        });
    }
    
    function build_edit_form(solution) {
        let form = $("<form></form>");
        let text_area_div = $("<div></div>", {
            class: "form-control"
        });
        let text_area = $("<textarea></textarea>", {
            text: solution.solution_html
        });
        text_area_div.append(text_area);
        form.append(text_area_div);
        
    }
    
    function format_date(date) {
        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let day = date.getDate();
        let month = months[date.getMonth()];
        let year = date.getFullYear();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let second = date.getSeconds();
        return day + " " + month + " " + year + " " + hour + ":" + minute + ":" + (second < 10 ? "0" + second : second); 
    }
    
    function check_notifications() {
        let notifications = contentData.comments.filter(c => c.current && c.name != user.name);
        notifications.sort((a, b) => new Date(b.date) - new Date(a.date));
        $("#notification-dropdown").html("<div class='dropdown-header'>Recent notifications</div>");
        notifications.forEach(n => {
            let solution = contentData.solutions.filter(s => s.id == n.sid)[0];
            $("#notification-dropdown").append($("<a></a>", {
                class: "dropdown-item",
                href: "#",
                html: n.name + " commented on " + (n.sid == user.id ? " your solution" : solution.name + "'s solution"),
                click: () => activate_solution(solution)
            }));
        });
        $("#notification-number").html(notifications.length > 0 ? notifications.length : "");
    }
    
    $("#question-collapse-button").click(() => {
        $("#question-collapse-button").text($("#question-collapse-button").text() == "hide" ? "show" : "hide");
    });
    $('[data-toggle="tooltip"]').tooltip();
    $("#feedback-form form").on("submit", () => {
        let _text = $("#comment").val();
        let _date = format_date(new Date());
        let _name = user.name;
        let _cid = contentData.comments.map(c => c.cid).reduce((a, c) => c > a ? c : a) + 1;
        let _sid = current_solution.id;
        let _replyid = $(".l-active").data("cid");
        let _current = false;
        contentData.comments.push({
            cid: _cid,
            replyid: _replyid,
            sid: _sid,
            name: _name,
            date: _date,
            text: _text,
            current: _current
        });
        activate_solution(current_solution);
        $("#comment").val("");
    });
    $("#edit-solution").click(() => {
        $("#edit-solution").text($("#edit-solution").text() == "edit" ? "cancel" : "edit");
        if ($("#edit-solution").text() == "cancel") {
            $("#solution").hide();
            $("#solution-date").hide();
            $("#modify-solution").show();
            $("#new-solution").val(contentData.solutions[0].solution_html);
        } else {
            $("#solution").show();
            $("#solution-date").show();
            $("#modify-solution").hide();
        }
    });
    $("#submit-modification").on("click", () => {
        contentData.solutions[0].solution_html = $("#new-solution").val();
        activate_solution(contentData.solutions[0]);
        contentData.solutions[0].last_modified = format_date(new Date());
        $("#edit-solution").click();
        activate_solution(contentData.solutions[0]);
        $("#sticky-modal").modal();
    });
    $("#modify-cancel").click(() => $("#edit-solution").click());
    $("#new-sticky").click(() => {
        contentData.solutions[0].stickied = $("#sticky-text").val();
        $("#sticky-modal").modal("toggle");
        activate_solution(user);
    });
    $("#no-sticky").click(() => {
        contentData.solutions[0].stickied = "";
        $("#sticky-modal").modal("toggle");
        activate_solution(user);
    });
    $("#same-sticky").click(() => {
        $("#sticky-modal").modal("toggle");
        activate_solution(user);
    });
});