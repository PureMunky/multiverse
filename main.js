var api = (function() {
    // Elements
    const output = document.getElementById('output');
    const txtNewTitle = document.getElementById('newTitle');
    const btnAddNode = document.getElementById('newAdd');
    const btnReset = document.getElementById('reset');
    const txtData = document.getElementById('data');

    // Events
    btnAddNode.addEventListener('click', function() {
        add(txtNewTitle.value);
    });
    btnReset.addEventListener('click', function() {
        data = JSON.parse(txtData.value);
        print();
    });

    // Vars
    var data = {
        currentNode: '',
        nodes:  {},
        links: {}
    };
    
    function uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
    }

    function linkId(prevId, nextId) {
        return prevId + '-' + nextId;
    }

    function init() {
        add('Beginning');
        add('Middle A');
        add('Middle B');
        add('End');
        print();
    }

    function add(title) {
        var id = uuidv4();
        data.nodes[id] = {
            id: id,
            title: title,
            description: ''
        };
        createLink(id, id, 'self');
        print();
    }

    function setCurrentNode(id) {
        data.currentNode = id;
        print();
    }

    function createLink(prevId, nextId, relationship) {
        data.links[linkId(prevId, nextId)] = {
            prevId: prevId,
            nextId: nextId,
            relationship: relationship,
            description: ''
        };
        print();
    }

    function describeLink(id) {
        data.links[id].description = document.getElementById('txt-' + id).value;
        print();
    }

    function nodeToHtml(id, history) {
        var rtnHtml = '';
        var cHistory = JSON.parse(JSON.stringify(history));
        cHistory[id] = 'done';
        rtnHtml = '<li>' + data.nodes[id].title + '<ul>';

        Object.keys(data.links).forEach(linkId => {
            var l = data.links[linkId];
            if(l.prevId == id && l.relationship == 'yes' && !cHistory[l.nextId]) {
                rtnHtml += nodeToHtml(l.nextId, cHistory);
            }
        });

        rtnHtml += '</ul></li>'; 
        return rtnHtml;
    }

    function print() {
        output.innerHTML = '';
        var current = '';
        var display = '';
        var questions = '';

        if(data.currentNode != '') {
            current = '<div style="border: 1px solid #ccc;">Current: ' + data.nodes[data.currentNode].title + '<ul>';

            current += nodeToHtml(data.currentNode, {});

            current += '</ul></div>';
        }

        Object.keys(data.nodes).forEach(id => {
            var n = data.nodes[id];
            display += n.title + ' - ' + n.id + ' - <button onclick="api.current(\'' + id + '\')">Current</button><br/>';

            Object.keys(data.nodes).forEach(id2 => {
                var n2 = data.nodes[id2];
                var link = data.links[linkId(id, id2)];
                if(!link) {
                    questions += '<br/>Could ' + n2.title + ' happen after ' + n.title + '?<br/>';
                    questions += '<a href="javascript:api.link(\'' + id + '\', \'' + id2 + '\', \'no\');">No</a> ';
                    questions += '<a href="javascript:api.link(\'' + id + '\', \'' + id2 + '\', \'yes\');">Yes</a>';
                } else if(link.relationship == 'yes' && link.description == '') {
                    questions += '<br/>Describe what it looks like to have ' + n2.title + ' happen after ' + n.title + '?<br/>';
                    questions += '<input type="text" id="txt-' + linkId(id, id2) + '" /><button onclick="api.describe(\'' + linkId(id, id2) + '\')">Save</button>';
                }
            })
        });

        output.innerHTML = current + display + questions;
        txtData.value = JSON.stringify(data);
    }

    init();

    return {
        link: createLink,
        describe: describeLink,
        current: setCurrentNode
    };
}())

