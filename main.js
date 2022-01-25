var api = (function() {
    // Elements
    const output = document.getElementById('output');
    const txtNewTitle = document.getElementById('newTitle');
    const txtNewLabels = document.getElementById('newLabels');
    const btnAddNode = document.getElementById('newAdd');
    const btnReset = document.getElementById('reset');
    const txtData = document.getElementById('data');

    // Events
    btnAddNode.addEventListener('click', function() {
        var id = add(txtNewTitle.value, txtNewLabels.value);
        print();
    });
    btnReset.addEventListener('click', function() {
        data = JSON.parse(txtData.value);
        print();
    });

    // Vars
    var data = {
        currentNode: '',
        nodes:  {},
        links: {},
        labels: []
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
        add('Beginning', '+alive');
        add('Travel to the Inn', '+thief,+key,#boss,*alive');
        add('Travel to the Cave', '+paladin,#boss,*alive');
        add('Travel to the Church', '-paladin,#boss,*alive');
        add('Fight Boss', '*key,-paladin,+boss,#boss,*alive,#avoid');
        add('Win Boss', '*boss,+wand,+child,*alive,-boss,#avoid,+win,#win')
        add('Lose to Boss', '*boss,-boss,-paladin,-thief,-wizard,-alive,*alive,#avoid')
        add('Avoid Boss', '*thief,+wand,+child,#boss,*alive,+avoid,+win,#win')
        add('Find Wizard', '*wand,*alive')

        // add('Beginning','');
        // add('Travel to the Inn', '');
        // add('Travel to the Cave', '');
        // add('Travel to the Church', '');
        // add('Fight Boss', '');
        // add('Win Boss', '')
        // add('Lose to Boss', '')
        // add('Avoid Boss', '')
        // add('Find Wizard', '')

        print();
    }

    function add(title, labels) {
        var id = uuidv4();
        data.nodes[id] = {
            id: id,
            title: title,
            description: '',
            done: false,
            labels: {
                add: [],
                remove: [],
                require: [],
                avoid: []
            }
        };
        createLink(id, id, 'self');
        parseLabels(id, labels);
        return id;
    }

    function parseLabels(id, labels) {
       var labelStructure = {
            add: [],
            remove: [],
            require: [],
            avoid: []
        };
        var labelArray = labels.split(',');
        
        labelArray.forEach(l => {
            if(l[0] == '+') {
                labelStructure.add.push(l.substring(1))
            }
            if(l[0] == '-') {
                labelStructure.remove.push(l.substring(1))
            }

            if(l[0] == '*') {
                labelStructure.require.push(l.substring(1))
            }
            if(l[0] == '#') {
                labelStructure.avoid.push(l.substring(1))
            }
        });

        data.nodes[id].labels = labelStructure;
    }

    function setCurrentNode(id) {
        data.currentNode = id;
        print();
    }

    function createLink(prevId, nextId, relationship) {
        // data.links[linkId(prevId, nextId)] = {
        //     prevId: prevId,
        //     nextId: nextId,
        //     relationship: relationship,
        //     description: ''
        // };

        if(relationship=='yes') {

        }
        print();
    }

    function describeLink(id) {
        data.links[id].description = document.getElementById('txt-' + id).value;
        print();
    }

    function nodeToHtml(id, history, labels) {
        var rtnHtml = '';
        var cHistory = JSON.parse(JSON.stringify(history));
        var cLabels = JSON.parse(JSON.stringify(labels));
        var node = data.nodes[id];

        cHistory[id] = 'done';
        rtnHtml = '<li>' + node.title + '<ul>';

        node.labels.add.forEach(a => {
            cLabels[a] = true;
        });

        node.labels.remove.forEach(r => {
            cLabels[r] = false;
        });

        // Object.keys(data.links).forEach(linkId => {
        //     var l = data.links[linkId];

        //     // Do I want to get rid of the direct relationships and just say after?
        //     // Do I want to use labels as the requirements for building out the tree?
        //     if(l.prevId == id
        //         && l.relationship == 'yes'
        //         && !cHistory[l.nextId]
        //         && meetsLabelRequirements(l.nextId, cLabels)
        //         && isViableFutureNode(l.nextId)) {
        //         rtnHtml += nodeToHtml(l.nextId, cHistory, cLabels);
        //     }
        // });

        Object.keys(data.nodes).forEach(nodeId => {
            var n = data.nodes[nodeId];

            // Do I want to get rid of the direct relationships and just say after?
            // Do I want to use labels as the requirements for building out the tree?
            if(!cHistory[nodeId]
                && meetsLabelRequirements(nodeId, cLabels)
                && isViableFutureNode(nodeId)) {
                rtnHtml += nodeToHtml(nodeId, cHistory, cLabels);
            }
        });

        rtnHtml += '</ul></li>'; 
        return rtnHtml;
    }

    function meetsLabelRequirements(id, labels) {
        var node = data.nodes[id];
        var meets = true;

        node.labels.require.forEach(l => {
            if (!labels[l]) {
                meets = false;
            }
        })

        if(meets) {
            node.labels.avoid.forEach(l => {
                if (labels[l]) {
                    meets = false;
                }
            }) 
        }

        return meets;
    }

    function isViableFutureNode(id) {
        var n = data.nodes[id];

        return !n.done;
    }

    function print() {
        output.innerHTML = '';
        var current = '';
        var display = '';
        var questions = '';

        if(data.currentNode != '') {
            current = '<div style="border: 1px solid #ccc;">Current: ' + data.nodes[data.currentNode].title + '<ul>';

            current += nodeToHtml(data.currentNode, {}, {});

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

