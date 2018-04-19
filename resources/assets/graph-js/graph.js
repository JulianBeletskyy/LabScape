
//var canvas = document.getElementById('graphCanvas');
//var context = canvas.getContext('2d');
//var canvasWidth = 600;
//var canvasHeight = 400;
//var graphRatio = 15;
//var camera = { x : canvas.width / 2, y : canvas.height / 2};

var mainLabId = 77;

MapViewEnum = {
    HOSPITALS : "Hospitals",
    HOSPITALS_PEOPLE : "HospitalsPeople",
    HOVER_OVER_PERSON : "HoverOverPerson"
};

NodeTypeEnum = {
    HOSPITAL : "Hospital",
    PERSON : "Person"
};

EdgeTypeEnum = {
    HOSPITAL_HOSPITAL : "hospital_hospital",
    HOSPITAL_PERSON : "hospital_person",
    PERSON_PERSON : "person_person"
}

NodeStateEnum = {
    VISIBLE : "Visible",
    HIDDEN : "Hidden",
    SNEAK_PEAK : "SneakPeak",
    APPEARING : "Appearing",
    DISSAPEARING : "Dissapearing"
}

ConnectionTypeEnum = {
    COAUTOR : 1,
    CITED_PAPER : 2
}

ActionEnum = {
    SELECT_NODE : 0,
    DESELECT_NODE : 1
}

var BASE_URL = "http://localhost/~pdeboer/roche_labs/";

var previousActions = [];

var GRAPH_MARGIN = 10;
var MAX_LETTERS_PER_LABEL_LINE = 20;
var graphCanvas = null;

//var state = MapViewStateEnum.STABILIZING;
var nodesMap = {};
var edgesMap = {};
var datasetEdges = null;
var datasetNodes = null;
var lastFrameTimeMs = 0;
var APPEAR_FADE_TIME = 1.2;
var DISSAPEAR_FADE_TIME = 0.5;
var OFFSET_FADE_TIME = 0.1;
var FIT_TIME = 1;
var fitFlag = false;
var fitAnimationFlag = true;
var focusNode = null;
var tFullScreen = false;
var SNEAK_PEAK_ALPHA = 0.3;
var canvas;
var hasStabilization = true;

var fitScale = 0;
var mousePosition = { x : -10000, y : -10000 };

GraphStateEnum = {
    STABILIZING : 0,
    STEADY : 1,
    ANIMATING : 2
}

var graphState = 0;
var dataSourceSelect = [];
var selectedNode = null;

function GraphItem(){
    this.hasToUpdate = true;
    this.addedToGraph = false;
}

GraphItem.prototype.changeState = function(state, elapsedTime, nextState){
    switch (state){
        case NodeStateEnum.VISIBLE:
            this.alpha = 1;
            this.updateObject.hidden = false;
            break;
        case NodeStateEnum.SNEAK_PEAK:
            this.alpha = SNEAK_PEAK_ALPHA;
            this.updateObject.hidden = false;
            break;
        case NodeStateEnum.APPEARING:
            this.updateObject.hidden = false;
            this.startingAlpha = this.alpha;
            this.elapsedTime = elapsedTime;
            this.nextState = nextState;
            if (this.nextState == NodeStateEnum.VISIBLE){
                this.targetAlpha = 1;
            }else if (this.nextState == NodeStateEnum.SNEAK_PEAK){
                this.targetAlpha = SNEAK_PEAK_ALPHA;
            }
            break;
        case NodeStateEnum.HIDDEN:
            this.updateObject.hidden = true;
            this.alpha = 0;
            break;
        case NodeStateEnum.DISSAPEARING:
            this.updateObject.hidden = false;
            this.elapsedTime = 0;
            this.startingAlpha = this.alpha;
            this.targetAlpha = 0;
            break;
    }
    if (this instanceof GraphNode){
        for (var i = 0; i < this.validEdges.length; i++){
            this.validEdges[i].changeState(state, elapsedTime, nextState);
        }
    }
    this.state = state;
    this.hasToUpdate = true;

    this.updateAddToGraph();
}

GraphItem.prototype.updateAddToGraph = function(){
    switch (this.state){
        case NodeStateEnum.HIDDEN:
            if (this.addedToGraph){
                if (this instanceof GraphEdge && datasetEdges){
                    datasetEdges.remove(this);
                }else if (this instanceof GraphNode && datasetNodes){
                    datasetNodes.remove(this);
                }
                this.addedToGraph = false;
            }
            break;
        default:
            if (!this.addedToGraph){
                if (this instanceof GraphEdge && datasetEdges){
                    datasetEdges.add(this);
                    datasetEdges.update(this.startupObject);
                }else if (this instanceof GraphNode && datasetNodes){
                    datasetNodes.add(this);
                    datasetNodes.update(this.startupObject);
                }
                this.addedToGraph = true;
            }
            break;
    }
}

GraphItem.prototype.update = function(delta){
    switch (this.state){
        case NodeStateEnum.APPEARING:
            this.elapsedTime += delta / APPEAR_FADE_TIME;
            if (this.elapsedTime >= 1){
                this.changeState(this.nextState);
            }
            this.alpha = clamp(this.startingAlpha + EasingFunctions.easeOutQuad(this.elapsedTime) * (this.targetAlpha - this.startingAlpha), 0, 1);
            this.hasToUpdate = true;
            break;
        case NodeStateEnum.DISSAPEARING:
            this.elapsedTime += delta / DISSAPEAR_FADE_TIME;
            if (this.elapsedTime >= 1){
                this.changeState(NodeStateEnum.HIDDEN);
                fitFlag = true;
            }
            this.alpha = clamp(this.startingAlpha + EasingFunctions.easeOutQuad(this.elapsedTime) * (this.targetAlpha - this.startingAlpha), 0, 1);
            this.hasToUpdate = true;
            break;
    }

//              if (this.updateObject.opacity != undefined){
    if (this instanceof GraphEdge){
        this.updateObject.color.opacity = this.alpha;
    }else{
        this.updateObject.color = this.getUpdateObjectColor();
        this.updateObject.font.color = "rgba(" + this.fontColor.r + "," + this.fontColor.g + "," + this.fontColor.b + ","+this.alpha+")";
    }
}

GraphItem.prototype.getUpdateObjectColor = function(){
    if (this.hover){
        return "rgba(" + this.selectionColor.r + "," + this.selectionColor.g + "," + this.selectionColor.b + "," + this.alpha + ")";
    }else{
        return "rgba(" + this.color.r + "," + this.color.g + "," + this.color.b + "," + this.alpha + ")";
    }
}

GraphItem.prototype.shouldUpdate = function(){
    return (this.hasToUpdate && this.addedToGraph);
}

function GraphEdge(id, from, to, edgeType, edgeWeight, connectionType){
    this.id = id;
    this.from = from;
    this.to = to;
    this.state = NodeStateEnum.VISIBLE;
    this.edgeType = edgeType;

    this.nodes = [];

    this.startupObject = { id : this.id, width: edgeWeight};
    this.updateObject = { color: {opacity : 0, inherit : false}, hidden : false, id : this.id};
    this.elapsedTime = 0;
    this.alpha = 1;

    this.color = { r : 150, g : 150, b : 250};
    this.selectionColor = { r : 120, g : 120, b : 220};

    // valid only for person to person connections
    this.connections = [];
    this.clabel = "";
    if (connectionType != -1){
        this.connections.push({weight : edgeWeight, type : connectionType, from: from, to: to});
        this.generateEdgeLabel();
    }

    this.hover = false;
}

GraphEdge.prototype = new GraphItem();
GraphEdge.prototype.constructor = GraphEdge;

GraphEdge.prototype.shouldBeAddedToGraph = function(){
    return (nodesMap[this.from].shouldBeAddedToGraph() && nodesMap[this.to].shouldBeAddedToGraph());
}

GraphEdge.prototype.isValidEdge = function(){
    var valid = true;
    if (!nodesMap[this.from].showableNode || !nodesMap[this.to].showableNode){
        valid = false;
    }else if (nodesMap[this.from].type == NodeTypeEnum.PERSON && nodesMap[this.to].type == NodeTypeEnum.PERSON){
        if (dataSourceSelect.length != 0){
            valid = false;
            for (var i = 0; i < dataSourceSelect.length; i++){
                for (var j = 0; j < this.connections.length; j++){
                    if (this.connections[j].type == dataSourceSelect[i]){
                        valid = true;
                        break;
                    }
                }
            }
        }
    }
    return valid;
}

GraphEdge.prototype.adjacentNodesVisible = function(){
    var v = true;
    if (nodesMap[this.from].state == NodeStateEnum.HIDDEN || nodesMap[this.from].state == NodeStateEnum.DISSAPEARING)
        v = false;
    if (nodesMap[this.to].state == NodeStateEnum.HIDDEN || nodesMap[this.to].state == NodeStateEnum.DISSAPEARING)
        v = false;
    return v;
}

GraphEdge.prototype.generateEdgeLabel = function(){
    this.clabel = "";
    for (var i = 0; i < this.connections.length; i++){
        var con = this.connections[i];
        switch (con.type){
            case ConnectionTypeEnum.COAUTOR:
                this.clabel += nodesMap[con.from].label + " and " + nodesMap[con.to].label + "\nwrote " + con.weight + " article" + (this.edgeWeight == 1? "" : "s") + " together. ";
                break;
            case ConnectionTypeEnum.CITED_PAPER:
                this.clabel += nodesMap[con.from].label + " cited\n" + nodesMap[con.to].label + " " + con.weight + " time" + (this.edgeWeight == 1? "." : "s. ");
                break;
        }
    }
}

GraphEdge.prototype.setHover = function(hover){
    this.hover = hover;
    if (this.hover){
        this.updateObject.label = this.clabel;
    }else{
        this.updateObject.label = "";
    }
    this.hasToUpdate = true;
}

GraphEdge.prototype.addConnectionType = function(from, to, type, weight){
    if (type == ConnectionTypeEnum.COAUTOR){
        var foundCoauthor = false;
        for (var i = 0; i < this.connections.length; i++){
            if (this.connections[i].type == type){
                this.connections[i].weight += weight;
                foundCoauthor = true;
                break;
            }
        }
        if (!foundCoauthor)
            this.connections.push({type: type, weight: weight, from: from, to: to});
    }else{
        this.connections.push({type: type, weight: weight, from: from, to: to});
    }

    this.generateEdgeLabel();

}

GraphEdge.prototype.addNode = function(node){
    this.nodes.push(node);
}

GraphEdge.prototype.getOtherNode = function(node){
    return (this.nodes[0] == node? this.nodes[1] : this.nodes[0]);
}

function GraphNode(intId, id, type, label, isMainLab, clusterId, isFromMainCluster){
    this.intId = intId;
    this.id = id;
    this.type = type;
    this.completeLabel = label;
    this.label = insertLineBreaks(label, isMainLab);
    this.state = NodeStateEnum.VISIBLE;
    // only available for hospitals
    this.isMainLab = isMainLab;
    this.clusterId = clusterId;
    this.isFromMainCluster = isFromMainCluster;

    this.edges = [];
    this.validEdges = [];
    this.hover = false;

    var node = this;
    /*
    var visNodeSelected = function(values, id, selected, hovering){
        values.color = node.getUpdateObjectColor(true);
    }*/

    this.startupObject = { id : this.id, heightConstraint : false, chosen : { node : false, label : false } }
    this.updateObject = { color : "", font : { color : "" }, hidden : false, id : this.id };

    this.elapsedTime = 0;
    this.alpha = 1;
    this.targetAlpha = 0;
    this.startingAlpha = 0;

    this.selected = false;

    switch (this.type){
        case NodeTypeEnum.HOSPITAL:
            this.color = { r : 150, g : 150, b : 250};
            this.fontColor = { r : 0, g : 0, b : 0};
            this.selectionColor = { r : 120, g : 120, b : 220};
            if (isMainLab){
                this.startupObject.heightConstraint = { valign: "middle", minimum: 30 };
                this.updateObject.font = { multi : true };
                this.color = { r : 100, g : 100, b : 200};
            }else if (isFromMainCluster){
                this.color = { r : 50, g : 180, b : 50};
                this.selectionColor = { r : 80, g : 200, b : 80};
                this.fontColor = { r : 255, g : 255, b : 255};
            }
            break;
        case NodeTypeEnum.PERSON:
            this.color = { r : 150, g : 150, b : 150};
            this.selectionColor = { r : 120, g : 120, b : 120};
            this.fontColor = { r : 0, g : 0, b : 0};
            break;
    }

    // employee array (only for hospital);
    this.employees = [];

    // tells if this node can be added to the graph
    this.showableNode = true;
}

GraphNode.prototype = new GraphItem();
GraphNode.prototype.constructor = GraphNode;

GraphNode.prototype.shouldBeAddedToGraph = function(){
    return (this.showableNode && this.state == NodeStateEnum.VISIBLE);
}

GraphNode.prototype.updateShowableNode = function(){
    this.showableNode = false;
    switch (this.type){
        case NodeTypeEnum.HOSPITAL:
            this.showableNode = true;
            break;
        case NodeTypeEnum.PERSON:
            for (var i = 0; i < this.validEdges.length; i++){
                if (this.validEdges[i].getOtherNode().type == NodeTypeEnum.PERSON){
                    this.showableNode = true;
                    break;
                }
            }
            break;
    }
}

// valid edges are those edges that should be drawn.
GraphNode.prototype.updateValidEdges = function(){
    this.validEdges = [];
    for (var i = 0; i < this.edges.length; i++){
        var edge = this.edges[i];
        if (edge.isValidEdge()){
            this.validEdges.push(edge);
            if (edge.adjacentNodesVisible()){
                edge.changeState(NodeStateEnum.VISIBLE);
                fitFlag = true;
            }
        }else{
            switch (edge.state){
                case NodeStateEnum.VISIBLE:
                case NodeStateEnum.APPEARING:
                    edge.changeState(NodeStateEnum.HIDDEN);
                    fitFlag = true;
                    break;
            }
        }
    }
}

GraphNode.prototype.getExternalLink = function(){
    var url = "";
    switch (this.type){
        case NodeTypeEnum.PERSON:
            url = BASE_URL + "index.php//person/detail/" + this.intId;
            break;
        case NodeTypeEnum.HOSPITAL:
            url = BASE_URL + "index.php//labmap/detail/" + this.intId;
            break;
    }
    return url;
}

GraphNode.prototype.addEdge = function(edge){
    this.edges.push(edge);
}

GraphNode.prototype.hasPeopleLeftToShow = function(){
    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        if (edge.isValidEdge()){
            var otherNode = edge.getOtherNode(this);
            if (otherNode.type == NodeTypeEnum.PERSON && (otherNode.state != NodeStateEnum.VISIBLE)){
                return true;
            }
        }
    }
    return false;
}

GraphNode.prototype.peopleLeftToShow = function(){
    var count = 0;
    for (var i = 0; i < this.validEdges.length; i++){
        var otherNode = this.validEdges[i].getOtherNode(this);
        if (otherNode.type == NodeTypeEnum.PERSON && otherNode.state == NodeStateEnum.HIDDEN){
            count++;
        }
    }
    return count;
}

function insertLineBreaks(label, isMainLab){
    var tokens = label.split(" ");
    var generatedLabel = isMainLab? "<b>" : "";
    var lineLetters = 0;
    for (var i = 0; i < tokens.length; i++){
        if (lineLetters + tokens[i].length > MAX_LETTERS_PER_LABEL_LINE && i != 0){
            generatedLabel += (isMainLab? "</b>\n<b>" : "\n");
            lineLetters = 0;
        }
        generatedLabel += (lineLetters != 0? " " : "") + tokens[i];
        lineLetters += tokens[i].length;
    }
    generatedLabel += isMainLab? "</b>" : "";
    return generatedLabel;
}

GraphNode.prototype.click = function(){
    if (this.hasPeopleLeftToShow()){
        this.selectNode();
        previousActions.push({ action : ActionEnum.SELECT_NODE, node : this });
    }else{
        this.deselectNode(false);
        previousActions.push({ action : ActionEnum.DESELECT_NODE, node : this });
    }

    fitFlag = true;
}

GraphNode.prototype.deselectNode = function(onlySneakPeak){

    labgraph.setOptions({ physics : physicsOptions });

    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        var node = edge.getOtherNode(this);
        if (node.type == NodeTypeEnum.PERSON && (node.state == NodeStateEnum.SNEAK_PEAK || (!onlySneakPeak && node.state == NodeStateEnum.VISIBLE))){
            node.changeState(NodeStateEnum.DISSAPEARING);
        }
    }

    setTimeout(function(){
        fitCamera(true);
    }, 2000);

    selectedNode = this;
    updateSelectedNodeInfo();
}

GraphNode.prototype.selectNode = function(){
    var timeOffset = 0;
    var triggeredAnimation = false;

    labgraph.setOptions({ physics : physicsOptions });

    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        var node = edge.getOtherNode(this);
        if (node.type == NodeTypeEnum.PERSON){
            if (node.state == NodeStateEnum.SNEAK_PEAK || node.state == NodeStateEnum.APPEARING){
                node.changeState(NodeStateEnum.VISIBLE, timeOffset, NodeStateEnum.VISIBLE);
                edge.changeState(NodeStateEnum.VISIBLE, timeOffset, NodeStateEnum.VISIBLE);
            }else if (node.state == NodeStateEnum.HIDDEN){
                node.changeState(NodeStateEnum.APPEARING, timeOffset, NodeStateEnum.VISIBLE);
                edge.changeState(NodeStateEnum.APPEARING, timeOffset, NodeStateEnum.VISIBLE);
                timeOffset -= OFFSET_FADE_TIME;
                triggeredAnimation = true;
            }
        }
    }
    if (triggeredAnimation){
        wait(APPEAR_FADE_TIME - timeOffset, setSteadyGraph);
    }else{
        setSteadyGraph();
    }

    setTimeout(function(){
        fitCamera(true);
    }, 2000);

    selectedNode = this;
    updateSelectedNodeInfo()
}

GraphNode.prototype.getEmployeeCount = function(){
    var count = 0;
    switch (this.type){
        case NodeTypeEnum.HOSPITAL:
            count = this.employees.length;
            break;
    }
    return count;
}

GraphNode.prototype.addEmployee = function(id, name, workerType){
    this.employees.push({ id : id, name : name, type : workerType });
}

GraphNode.prototype.hasVisibleEdges = function(){
    var visibleEdges = false;
    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        if (edge.state == NodeStateEnum.VISIBLE){
            visibleEdges = true; break;
        }
    }
    return visibleEdges;
}

function updateSelectedNodeInfo(){
    if (tFullScreen && selectedNode){
        document.getElementById('nodeTitle').innerHTML = selectedNode.completeLabel;
        var employeeInfo = document.getElementById('employeeInfo');
        if (selectedNode.type == NodeTypeEnum.HOSPITAL){
            document.getElementById('employeeCount').innerHTML = selectedNode.getEmployeeCount() + " employee" + (selectedNode.getEmployeeCount() == 1? "" : "s") ;

            var employeeTypes = updateEmployeeList();

            var workerTypeSelect = document.getElementById('workerTypeSelect');
            emptySelect(workerTypeSelect);
            var option = document.createElement('option');
            option.text = "All";
            option.value = "All";
            workerTypeSelect.add(option);
            for (var i = 0; i < employeeTypes.length; i++){
                var option = document.createElement('option');
                option.text = employeeTypes[i];
                option.value = employeeTypes[i];
                workerTypeSelect.add(option);
            }
            $('#workerTypeSelect').material_select();

            employeeInfo.style.display = "block";
        }else{
            employeeInfo.style.display = "none";
        }
    }
}

function emptySelect(select){
    /*
    var length = select.options.length;
    for (i = 0; i < length; i++) {
        select.options[i] = null;
    }*/
    select.innerHTML = "";
}

// function called from the UI, when changing the visible workers by type
function updateEmployeeList(){
    var visibleWorkers = document.getElementById('workerTypeSelect').value;
    var employeeList = document.getElementById('employeeList');

    employeeList.innerHTML = "";
    var employeeTypes = [];
    for (var i = 0; i < selectedNode.employees.length; i++){
        var employee = selectedNode.employees[i];

        if (employee.type == visibleWorkers || visibleWorkers == "All" || visibleWorkers == ""){
            var employeeDiv = document.createElement('div');
            employeeDiv.classList.add("employeeRow");
            employeeDiv.innerHTML = employee.name;
            var empId = getPersonId(employee.id);

            if (employeeTypes.indexOf(employee.type) == -1)
                employeeTypes.push(employee.type);

            if (nodesMap[empId] && nodesMap[empId].showableNode){
                employeeDiv.innerHTML += " <span class='shownPerson rightPersonText'>Shown</span>";
            }else{
                employeeDiv.innerHTML += " <a class='addPersonLink rightPersonText' onclick='makeNodeShowable(\"" + empId + "\")'>Add</a>";
            }
            employeeList.appendChild(employeeDiv);
        }
    }

    employeeTypes.sort();

    return employeeTypes;
}

function makeNodeShowable(employeeId){
    var node = nodesMap[employeeId];
    node.showableNode = true;
    updateValidEdges();

    node.changeState(NodeStateEnum.VISIBLE);

    updateEmployeeList();
}

GraphNode.prototype.sneakPeakNode = function(){
    var timeOffset = 0;
    var triggeredAnimation = false;

    labgraph.setOptions({ physics : hoverPhysicsOptions });

    var revealingNodeCount = this.peopleLeftToShow();
    var revealedNodes = 0;
    var revealedNodeDistance = 200;

    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        var node = edge.getOtherNode(this);
        if (node.type == NodeTypeEnum.PERSON){
            if (node.state == NodeStateEnum.HIDDEN){
                var alpha = Math.PI * 2 / revealingNodeCount * revealedNodes;
                revealedNodes++;
                node.updateObject.x = this.x + revealedNodeDistance * Math.cos(alpha);
                node.updateObject.y = this.y + revealedNodeDistance * Math.sin(alpha);

                node.changeState(NodeStateEnum.APPEARING, timeOffset, NodeStateEnum.SNEAK_PEAK);
                edge.changeState(NodeStateEnum.APPEARING, timeOffset, NodeStateEnum.SNEAK_PEAK);
                triggeredAnimation = true;
            }
        }
    }

    if (triggeredAnimation && (graphState == GraphStateEnum.STEADY)){
        //this.zoomFocused(0.8);
    }

}

GraphNode.prototype.zoomFocused = function(zoomFactor){
    labgraph.moveTo( { position : { x : this.x, y : this.y }, offset : { x : mousePosition.x - graphCanvas.offsetWidth / 2, y : mousePosition.y - graphCanvas.offsetHeight / 2}, scale : labgraph.body.view.scale * zoomFactor, animation : { duration: FIT_TIME * 1000, easingFunction: "easeInOutQuad" }});
}

GraphNode.prototype.hideSneakPeakNode = function(){
    var timeOffset = 0;
    var triggeredAnimation = false;
    for (var i = 0; i < this.validEdges.length; i++){
        var edge = this.validEdges[i];
        var node = edge.getOtherNode(this);
        if (node.type == NodeTypeEnum.PERSON){
            if (node.state != NodeStateEnum.VISIBLE && node.state != NodeStateEnum.HIDDEN && node.state != NodeStateEnum.DISSAPEARING){
                node.changeState(NodeStateEnum.HIDDEN);
                edge.changeState(NodeStateEnum.HIDDEN);
                triggeredAnimation = true;
            }
        }
    }

    if (triggeredAnimation){
        fitFlag = true;
        fitAnimationFlag = false;
    }

}

function setSteadyGraph(){
    graphState = GraphStateEnum.STEADY;
}

var hospitals = [];
var people = [];
var hospitalConnections = [];
var personHospitalConnections = [];
var peopleConnections = [];
var physicsOptions = { enabled : true, /*, timestep : 0.66, minVelocity : 0.75,*/ barnesHut: { gravitationalConstant: -20000, springConstant: 0.04, avoidOverlap: 1, damping: 0.91 }, stabilization : false };
var hoverPhysicsOptions = { enabled : false, stabilization : { enabled : true } }

$(document).ready(function(){

    var INCOMING_DATA = {"related_labs":[{"id":"134","name":"Pedos AG","cluster_id":"69"},{"id":"351","name":"Onko Zentrum Zürich AG","cluster_id":"155"},{"id":"75","name":"Kantonsspital Baselland","cluster_id":"39"},{"id":"76","name":"Kantonsspital Baselland","cluster_id":"39"},{"id":"84","name":"PD Dr. med. Rolf Hügli, Chefarzt Institut für Radiologie und Nuklearmedizin, Kantonsspital Baselland","cluster_id":"39"},{"id":"85","name":"PD Dr. med. Rolf Hügli, Chefarzt Institut für Radiologie und Nuklearmedizin, Kantonsspital Baselland","cluster_id":"39"},{"id":"86","name":"PD Dr. med. Rolf Hügli, Chefarzt Institut für Radiologie und Nuklearmedizin, Kantonsspital Baselland","cluster_id":"39"},{"id":"77","name":"Kantonsspital Baselland","cluster_id":"39"}],"related_people":[{"id":"552","name":"Balli-Antunes Mariette Filomena","address_id":"77"},{"id":"1294","name":"Nguyen-Tran Bich Quyen","address_id":"77"},{"id":"2004","name":"Sutter Alain-André","address_id":"77"},{"id":"2130","name":"Valla-Simon Sophie","address_id":"77"},{"id":"2320","name":"YAN Pu","address_id":"77"},{"id":"2679","name":"Anani Prosper","address_id":"77"},{"id":"1440","name":"Pescia Graziano","address_id":"84"},{"id":"35","name":"Ducharne Jacques Jean-Louis Edouard","address_id":"86"},{"id":"350","name":"Glauser Frédéric André","address_id":"86"},{"id":"791","name":"Adatto Maurice","address_id":"86"},{"id":"1065","name":"Marangon-Rosay Anne Claire","address_id":"86"},{"id":"1144","name":"Merminod Thierry Roland Ernest","address_id":"86"},{"id":"1183","name":"Mock Pascal Michel","address_id":"86"},{"id":"1263","name":"NAFTANAILA Eugen","address_id":"86"},{"id":"1352","name":"Oppliger Roland","address_id":"86"},{"id":"2148","name":"Vento Bosch Cristina","address_id":"86"},{"id":"2682","name":"Della Torre Rocco Carlo Riccardo","address_id":"86"},{"id":"158","name":"Fasnacht Katrin","address_id":"134"},{"id":"286","name":"Gämperli Oliver","address_id":"134"},{"id":"351","name":"Gligorijevic Slobodan","address_id":"134"},{"id":"397","name":"Grossmann Imke","address_id":"134"},{"id":"580","name":"Hug Brennwald Maja Isabel","address_id":"134"},{"id":"598","name":"Baltsavias Gerasimos","address_id":"134"},{"id":"662","name":"Barandun Jürg","address_id":"134"},{"id":"823","name":"Kovári Helen","address_id":"134"},{"id":"844","name":"Kuchen Natalie Leila","address_id":"134"},{"id":"846","name":"Küest Silke Maria","address_id":"134"},{"id":"1019","name":"Lüthi Ursus","address_id":"134"},{"id":"1054","name":"Mamisch Nadja","address_id":"134"},{"id":"1478","name":"Popov Vladimir","address_id":"134"},{"id":"1555","name":"Reisch Robert Arnold","address_id":"134"},{"id":"1558","name":"Reitz Andre","address_id":"134"},{"id":"1561","name":"Remmen Friederike Christine","address_id":"134"},{"id":"1569","name":"Renner Christoph Robert","address_id":"134"},{"id":"1634","name":"Romero José Bartolomé","address_id":"134"},{"id":"1697","name":"Samaras Panagiotis","address_id":"134"},{"id":"1746","name":"Scherer Thomas","address_id":"134"},{"id":"1858","name":"Seiler Daniel","address_id":"134"},{"id":"1873","name":"Serra Andreas Lucas","address_id":"134"},{"id":"1888","name":"Simmen Beat R.","address_id":"134"},{"id":"1917","name":"Speiser Karl","address_id":"134"},{"id":"1927","name":"Stähelin Annina Elisabeth Deborah","address_id":"134"},{"id":"1957","name":"Stocker Reto","address_id":"134"},{"id":"2104","name":"Tüller Claudia, Charlotte","address_id":"134"},{"id":"2106","name":"Tuor Christoph Johannes","address_id":"134"},{"id":"2296","name":"Woernle Christoph Michael","address_id":"134"},{"id":"2339","name":"Zeitz Jonas","address_id":"134"},{"id":"2387","name":"Borovac-Alfirevic Mirela","address_id":"134"},{"id":"2716","name":"Dindo Daniel Ralph","address_id":"134"},{"id":"4","name":"Dolcan Ana-Maria","address_id":"351"},{"id":"7","name":"Domenichini Giulia","address_id":"351"},{"id":"11","name":"Donner Viviane Pascale","address_id":"351"},{"id":"17","name":"DOS SANTOS BRAGANçA Angel","address_id":"351"},{"id":"18","name":"Dos Santos Rocha André Alexandre","address_id":"351"},{"id":"20","name":"Dosso André","address_id":"351"},{"id":"22","name":"Andrey Véronique","address_id":"351"},{"id":"24","name":"Drakul Aneta","address_id":"351"},{"id":"28","name":"Drepper Michael David","address_id":"351"},{"id":"30","name":"Dromzée Eric","address_id":"351"},{"id":"32","name":"Andrieu ép. Vidal Isabelle Genevieve Simone","address_id":"351"},{"id":"33","name":"Dubois Natacha Yasmine Sonia","address_id":"351"},{"id":"34","name":"Dubouchet Laetitia Claudia","address_id":"351"},{"id":"37","name":"Dufey Anne Béatrice","address_id":"351"},{"id":"40","name":"Dugas Sarah Gina","address_id":"351"},{"id":"41","name":"Dulguerov Nicolas","address_id":"351"},{"id":"43","name":"Dumont Céline Françoise","address_id":"351"},{"id":"44","name":"Dumont Shireen","address_id":"351"},{"id":"50","name":"Dupraz Jean","address_id":"351"},{"id":"51","name":"Dupuis Laurent Olivier","address_id":"351"},{"id":"58","name":"Dusser ép. Benesty Perrine Annick Gabrielle","address_id":"351"},{"id":"62","name":"Duxbury Beatrice Jane","address_id":"351"},{"id":"63","name":"Duyck Céline","address_id":"351"},{"id":"73","name":"Eckers Franziska","address_id":"351"},{"id":"75","name":"Eddy Christine Elena","address_id":"351"},{"id":"82","name":"Egger Coraline Lily","address_id":"351"},{"id":"94","name":"Eichler David Paul","address_id":"351"},{"id":"97","name":"Ansaldi Yveline Janine","address_id":"351"},{"id":"110","name":"El Mestikawy Yousri","address_id":"351"},{"id":"113","name":"ANSORGE Alexandre","address_id":"351"},{"id":"127","name":"Eshmawey Mohamed Ahmed Morsy","address_id":"351"},{"id":"128","name":"Espa Cervena Katerina","address_id":"351"},{"id":"129","name":"Espinosa Laila","address_id":"351"},{"id":"134","name":"Etemadi Quddus","address_id":"351"},{"id":"135","name":"ETIENNE Léonard Marc Denis","address_id":"351"},{"id":"141","name":"Evdokimova Anna","address_id":"351"},{"id":"144","name":"Excoffier Sophie","address_id":"351"},{"id":"150","name":"Falco Teresa","address_id":"351"},{"id":"156","name":"Farhat Nesrine","address_id":"351"},{"id":"163","name":"Favre Melody","address_id":"351"},{"id":"164","name":"Favre Thibault Julien Philippe","address_id":"351"},{"id":"166","name":"Araeipour-Tehrani Yasha","address_id":"351"},{"id":"170","name":"Felice-Civitillo Cristina","address_id":"351"},{"id":"172","name":"Félix Garance Lydie","address_id":"351"},{"id":"176","name":"Fernex Lucie Odette","address_id":"351"},{"id":"178","name":"Ferraro Flavia","address_id":"351"},{"id":"179","name":"Ferreira Branco David","address_id":"351"},{"id":"180","name":"Ferreira Viveiros Tavares Dos Reis Andreia Maria","address_id":"351"},{"id":"184","name":"Arellano Osorio Mauricio Jose","address_id":"351"},{"id":"197","name":"Fleury Vanessa Myriam","address_id":"351"},{"id":"200","name":"Flory Samartino Jonathan Marc","address_id":"351"},{"id":"209","name":"Foletti Jean-Marc Louis Aimé","address_id":"351"},{"id":"211","name":"Folino David","address_id":"351"},{"id":"212","name":"Fontaine Laura Claudine","address_id":"351"},{"id":"216","name":"Forte Marques Ana Rita","address_id":"351"},{"id":"220","name":"Fotea Nicoleta-Monica","address_id":"351"},{"id":"226","name":"Franchin Julien","address_id":"351"},{"id":"232","name":"Frassati Dominique Louise Lucie","address_id":"351"},{"id":"238","name":"Arnoux Grégoire","address_id":"351"},{"id":"244","name":"Friedli Axel François Pascal","address_id":"351"},{"id":"249","name":"Frisk Antti Oskari","address_id":"351"},{"id":"250","name":"Frisone Daniele","address_id":"351"},{"id":"254","name":"Froidevaux Mathias Joël","address_id":"351"},{"id":"255","name":"Fructuoso Castellar Ana","address_id":"351"},{"id":"257","name":"Frund Chloé","address_id":"351"},{"id":"276","name":"Gaignard Marie-Estelle Nicole","address_id":"351"},{"id":"278","name":"Galati Romina","address_id":"351"},{"id":"279","name":"Assalino Michela","address_id":"351"},{"id":"283","name":"Assandri Francesca","address_id":"351"},{"id":"284","name":"Galova Andrea","address_id":"351"},{"id":"290","name":"Gantcheva Neli","address_id":"351"},{"id":"296","name":"Garelli Valentina","address_id":"351"},{"id":"299","name":"Gassend Jean-Loup Clarence Aimé","address_id":"351"},{"id":"315","name":"Auberson Lucille","address_id":"351"},{"id":"318","name":"Aubin Paul-Alexandre Louis Claude Tuan Anh","address_id":"351"},{"id":"319","name":"Genoud Mathieu","address_id":"351"},{"id":"322","name":"Georgescu Daniela","address_id":"351"},{"id":"324","name":"Gerber Annick Olivia","address_id":"351"},{"id":"325","name":"Achard Vérane Maud Marguerite","address_id":"351"},{"id":"331","name":"Ghinescu Ana Maria","address_id":"351"},{"id":"332","name":"GHITA Stefana Maria","address_id":"351"},{"id":"335","name":"Giannotti Federica","address_id":"351"},{"id":"339","name":"Gigon Anthony","address_id":"351"},{"id":"341","name":"Giovannoni Laurianne Santa","address_id":"351"},{"id":"342","name":"Girardet Anne Caroline","address_id":"351"},{"id":"343","name":"Girod Pierre-Pascal","address_id":"351"},{"id":"345","name":"Gkikopoulos Nikitas","address_id":"351"},{"id":"346","name":"Gkotsoulia Christina","address_id":"351"},{"id":"347","name":"Gkrezios Apostolos","address_id":"351"},{"id":"348","name":"Glanz Ludovic Georges","address_id":"351"},{"id":"356","name":"Gobitz Michaël Charles-Henri Serge","address_id":"351"},{"id":"358","name":"Godet Tony Aldo","address_id":"351"},{"id":"361","name":"Gomaa Dalia","address_id":"351"},{"id":"362","name":"Gomez Parada Karina Alexandra","address_id":"351"},{"id":"373","name":"Grabherr Silke","address_id":"351"},{"id":"379","name":"Gramatica Luca","address_id":"351"},{"id":"380","name":"Grandjean Alexandre","address_id":"351"},{"id":"381","name":"Grandoni Francesco Luca","address_id":"351"},{"id":"382","name":"Granieri Carla","address_id":"351"},{"id":"405","name":"Gschwind Markus Andreas","address_id":"351"},{"id":"406","name":"Gubana Francesca","address_id":"351"},{"id":"408","name":"Guber Ivo","address_id":"351"},{"id":"411","name":"Guedj Noémie Olivia","address_id":"351"},{"id":"412","name":"Guélat Quentin Simon","address_id":"351"},{"id":"413","name":"Guemara Romain Jan","address_id":"351"},{"id":"414","name":"Guessous Idris","address_id":"351"},{"id":"423","name":"Guillaume-Gentil Simon Bertrand","address_id":"351"},{"id":"424","name":"Guillermin Alexandre Andrea","address_id":"351"},{"id":"425","name":"Guinand Nils Olivier","address_id":"351"},{"id":"431","name":"Gurbanov Elvin","address_id":"351"},{"id":"436","name":"Bachofner Christelle","address_id":"351"},{"id":"452","name":"Hammer Nathalie Gabrielle","address_id":"351"},{"id":"457","name":"Hannouche Didier Zakaria","address_id":"351"},{"id":"460","name":"Harding Sonya Natalie","address_id":"351"},{"id":"481","name":"Bagetakos Ilias","address_id":"351"},{"id":"483","name":"Hayek Georges","address_id":"351"},{"id":"490","name":"Bahadori Atessa","address_id":"351"},{"id":"499","name":"Hensen Maxime","address_id":"351"},{"id":"507","name":"Herpe Guillaume Jean Marie","address_id":"351"},{"id":"510","name":"Herrera Bruno","address_id":"351"},{"id":"537","name":"Hoang Xavier Philippe","address_id":"351"},{"id":"540","name":"Hochstrasser Denis","address_id":"351"},{"id":"560","name":"Hoogewoud Florence","address_id":"351"},{"id":"568","name":"Hsieh Julien Wen","address_id":"351"},{"id":"569","name":"Hua ép. Stolz Julie","address_id":"351"},{"id":"583","name":"Hugon ép. Rodin Justine","address_id":"351"},{"id":"597","name":"Ibsen usage Ambroise-Ibsen Arni","address_id":"351"},{"id":"600","name":"IGLESIAS Juan Fernando","address_id":"351"},{"id":"602","name":"Ilario Caterina","address_id":"351"},{"id":"611","name":"IRANMANESH Pouya","address_id":"351"},{"id":"616","name":"Iten Lea","address_id":"351"},{"id":"620","name":"Jaaidi Laila","address_id":"351"},{"id":"621","name":"Jacob Maxime Valéry Charles","address_id":"351"},{"id":"623","name":"Jacot Claude-René Guillaume","address_id":"351"},{"id":"625","name":"Jacquelin-Ravel Nathalie Jeannine Jacqueline","address_id":"351"},{"id":"628","name":"Jalbert Bénédicte Marie Claude","address_id":"351"},{"id":"630","name":"Janickova Katarina","address_id":"351"},{"id":"631","name":"Jannelli Gianpaolo","address_id":"351"},{"id":"636","name":"Jastrow Meyer Nicole","address_id":"351"},{"id":"637","name":"Jeandin Elisabeth Angélique Madeleine Renée","address_id":"351"},{"id":"646","name":"Bapst Thomas Léo","address_id":"351"},{"id":"647","name":"Jimaja Wedali Emmanuel Bamidele Antoine","address_id":"351"},{"id":"651","name":"Johner Nicolas Jin Pierre","address_id":"351"},{"id":"654","name":"Joliat Charles Victor Norwood","address_id":"351"},{"id":"656","name":"Jolou Jalal","address_id":"351"},{"id":"660","name":"Jornayvaz François Roland","address_id":"351"},{"id":"661","name":"Joseph Jean-Marc","address_id":"351"},{"id":"664","name":"Jotterand Valérie Sandra","address_id":"351"},{"id":"665","name":"Jouan ép. Flahault Chrystel Fernande Renée Elyane","address_id":"351"},{"id":"667","name":"Juillerat André Alain","address_id":"351"},{"id":"669","name":"Jung Minoa Karin","address_id":"351"},{"id":"678","name":"Kaczmarek Chloé Kim","address_id":"351"},{"id":"687","name":"Kaiser Laurent Alphonse, Félix","address_id":"351"},{"id":"689","name":"Kaiser Stefan","address_id":"351"},{"id":"691","name":"Kakoraiti Emmanouela","address_id":"351"},{"id":"697","name":"Kalogeropoulou Eleni","address_id":"351"},{"id":"698","name":"Kamani Christel Hermann","address_id":"351"},{"id":"702","name":"Kaparos Nikolaos","address_id":"351"},{"id":"708","name":"Barde Lia Annick","address_id":"351"},{"id":"709","name":"Karege Gatete Félix","address_id":"351"},{"id":"710","name":"Karentzos Alexandros","address_id":"351"},{"id":"713","name":"Karpathiou Chariton-Konstantinos","address_id":"351"},{"id":"715","name":"Kartotaroeno Jessica Samira","address_id":"351"},{"id":"718","name":"Kastritis Ioannis","address_id":"351"},{"id":"724","name":"Kaufmann Fabrice","address_id":"351"},{"id":"726","name":"Kecik Mateusz Mariusz","address_id":"351"},{"id":"730","name":"Kehoe Samuel David","address_id":"351"},{"id":"731","name":"Keli Barcelos ép. Perret Liaudet Gleicy","address_id":"351"},{"id":"737","name":"Kelly Kayla Alicia","address_id":"351"},{"id":"738","name":"Kembi Guillaume Elyes","address_id":"351"},{"id":"740","name":"Barnaure-Nachbar Isabelle","address_id":"351"},{"id":"741","name":"Kerbrat Romain","address_id":"351"},{"id":"751","name":"Khodr Dany François","address_id":"351"},{"id":"754","name":"Barras Eugénie","address_id":"351"},{"id":"758","name":"Kiss-Bodolay Daniel","address_id":"351"},{"id":"763","name":"Klauser Paul Frédéric","address_id":"351"},{"id":"765","name":"Kleimberg Margaux","address_id":"351"},{"id":"771","name":"Klepper Maureen Claudia","address_id":"351"},{"id":"793","name":"Koegler-Tarpinian Flora Anaïd","address_id":"351"},{"id":"802","name":"Bartolone Placido","address_id":"351"},{"id":"812","name":"Kopp Benoît Quentin","address_id":"351"},{"id":"816","name":"Kössler Thibaud Pierre Marie","address_id":"351"},{"id":"820","name":"Kountouri Melpomeni","address_id":"351"},{"id":"847","name":"Küffer Julie","address_id":"351"},{"id":"851","name":"Batruch Matteï Hugo","address_id":"351"},{"id":"852","name":"Kull Corey Alexander","address_id":"351"},{"id":"857","name":"Kumps Camille","address_id":"351"},{"id":"865","name":"Baud Maxime Olivier","address_id":"351"},{"id":"869","name":"Kuster Matthias Axel","address_id":"351"},{"id":"875","name":"Baud Olivier François Georges","address_id":"351"},{"id":"877","name":"Lacour Oriane","address_id":"351"},{"id":"878","name":"Baudino Antoine Romain","address_id":"351"},{"id":"879","name":"Baudoin Julien Roger Pierre","address_id":"351"},{"id":"886","name":"Lamanna Giorgio","address_id":"351"},{"id":"887","name":"Lamartine Sabido Monteiro Marta","address_id":"351"},{"id":"889","name":"Lambert Nelle France","address_id":"351"},{"id":"894","name":"Lamy Mona Simone","address_id":"351"},{"id":"900","name":"Lange Sören","address_id":"351"},{"id":"901","name":"Lanier Cédric Maxime","address_id":"351"},{"id":"905","name":"Laroue Thomas Eugène","address_id":"351"},{"id":"906","name":"Larpin Christophe Nicolas","address_id":"351"},{"id":"907","name":"Laspa Evgenia","address_id":"351"},{"id":"915","name":"Lauffer Cédric David","address_id":"351"},{"id":"918","name":"Lauria Francesca","address_id":"351"},{"id":"919","name":"Lavalley Adrien Alain","address_id":"351"},{"id":"921","name":"Lazarczyk Maciej Jakub","address_id":"351"},{"id":"923","name":"Lazzarotto Benjamin Didier","address_id":"351"},{"id":"926","name":"Le Gouëff Anouk Isabelle Oriane","address_id":"351"},{"id":"927","name":"Le Peillet Damien Joseph Marius","address_id":"351"},{"id":"929","name":"Lécluse-Barth Julien Mathias Charles Pierre","address_id":"351"},{"id":"930","name":"Ledermann Audrey Maeva","address_id":"351"},{"id":"932","name":"Legrand Emilie","address_id":"351"},{"id":"942","name":"Leidi Antonio Siro Gabriele Benedetto","address_id":"351"},{"id":"947","name":"Lenggenhager Lauriane Maeva","address_id":"351"},{"id":"948","name":"Lenoir Vincent Micaël","address_id":"351"},{"id":"951","name":"Lepot Ariane Sogand Monique Homa","address_id":"351"},{"id":"953","name":"Leszek Alexandre","address_id":"351"},{"id":"956","name":"Leuba Fink Florence Catherine","address_id":"351"},{"id":"962","name":"Baumann Pia Patricia","address_id":"351"},{"id":"967","name":"Lidsky Deborah Claire Esther","address_id":"351"},{"id":"970","name":"Liernur Thibaut Dominique","address_id":"351"},{"id":"973","name":"Ligoutsikou Konstantina","address_id":"351"},{"id":"974","name":"Lima Faria Luis","address_id":"351"},{"id":"975","name":"Limonta Alessandro Luigi","address_id":"351"},{"id":"981","name":"Liot Emilie Marie Madeleine","address_id":"351"},{"id":"985","name":"Lironi Céline","address_id":"351"},{"id":"987","name":"Baumberger Marine","address_id":"351"},{"id":"994","name":"Lombardi Fäh Valeria","address_id":"351"},{"id":"995","name":"Longval Thomas Sensen","address_id":"351"},{"id":"1000","name":"Lorillard Solenn Christine Louise","address_id":"351"},{"id":"1004","name":"Loubet épouse Privat Nadège Amédée Jeannine","address_id":"351"},{"id":"1005","name":"Louge Pierre Georges","address_id":"351"},{"id":"1007","name":"Lozano Calvo Jose Jeronimo","address_id":"351"},{"id":"1009","name":"Baumgartner Mélanie","address_id":"351"},{"id":"1011","name":"Lucas Bénédicte Elisabeth Simone","address_id":"351"},{"id":"1030","name":"Mach Thierry Alexandre","address_id":"351"},{"id":"1031","name":"Mach Celia Amélie","address_id":"351"},{"id":"1036","name":"Magnin ép. Verschelde Sophie Andrée Renée","address_id":"351"},{"id":"1043","name":"Maillard Julien Gabriel Philippe","address_id":"351"},{"id":"1045","name":"Maiorano Alessandra","address_id":"351"},{"id":"1052","name":"Malézieux ép. Picard Astrid Marie","address_id":"351"},{"id":"1053","name":"Bauwens Marine Christine","address_id":"351"},{"id":"1059","name":"Mansi Vincent Michel","address_id":"351"},{"id":"1063","name":"Mappoura Maria","address_id":"351"},{"id":"1064","name":"Maragkoudakis Christos","address_id":"351"},{"id":"1066","name":"Marchal Ophélie Marie","address_id":"351"},{"id":"1068","name":"Marescassier Hélène Ariane","address_id":"351"},{"id":"1070","name":"Markham Genequand Lydia","address_id":"351"},{"id":"1077","name":"Beauverd Yan","address_id":"351"},{"id":"1082","name":"Martin-Salvaj Gallice","address_id":"351"},{"id":"1083","name":"Marull Paretas Emma","address_id":"351"},{"id":"1089","name":"Massalou Damien Léon Gabriel","address_id":"351"},{"id":"1091","name":"Masson Raphaël","address_id":"351"},{"id":"1092","name":"Massuyeau Axelle Hélène Marie","address_id":"351"},{"id":"1095","name":"Matos Charlotte Elisabeth","address_id":"351"},{"id":"1096","name":"Matta Georges","address_id":"351"},{"id":"1099","name":"Matthes Thomas Wilhelm","address_id":"351"},{"id":"1115","name":"Maziarski Philippe Raphaël","address_id":"351"},{"id":"1117","name":"Mazzola Olivia Mélanie","address_id":"351"},{"id":"1119","name":"McLaren Sophie Louise","address_id":"351"},{"id":"1121","name":"Meert Vincent Walter Etienne Ghislain","address_id":"351"},{"id":"1122","name":"Meeùs Léopold Béatrice","address_id":"351"},{"id":"1125","name":"Becker Laura","address_id":"351"},{"id":"1138","name":"Mendes Aguiar Santos Aline","address_id":"351"},{"id":"1148","name":"Meskaldji Mahacine","address_id":"351"},{"id":"1152","name":"Meuli Joachim Nicolas Edouard","address_id":"351"},{"id":"1153","name":"Meuli Vania Stéphanie","address_id":"351"},{"id":"1161","name":"Meylan Nadège","address_id":"351"},{"id":"1164","name":"MICHEL Yann Frédéric","address_id":"351"},{"id":"1166","name":"Michels Chloé Caroline Julia","address_id":"351"},{"id":"1168","name":"Miéville Christian","address_id":"351"},{"id":"1170","name":"Millee Jean-Charles","address_id":"351"},{"id":"1174","name":"Mirlesse Nicolas Benoît Akim","address_id":"351"},{"id":"1176","name":"Mirzoyan Boris","address_id":"351"},{"id":"1179","name":"Mitrovic Stéphane Sinisha","address_id":"351"},{"id":"1184","name":"Moens Kevin","address_id":"351"},{"id":"1185","name":"Moeri Michaël Jean-Jacques","address_id":"351"},{"id":"1193","name":"Monney Marine","address_id":"351"},{"id":"1194","name":"Monsellato Ermelinda","address_id":"351"},{"id":"1195","name":"Montavon Gisèle Salomé","address_id":"351"},{"id":"1202","name":"Morel Philippe","address_id":"351"},{"id":"1206","name":"Morin ép. Zorman Sarah Florence Isabelle","address_id":"351"},{"id":"1207","name":"Morisot Quentin Marie Olivier Alexis","address_id":"351"},{"id":"1208","name":"Morlan Thibaud Sébastien Pierre","address_id":"351"},{"id":"1209","name":"Bellaminutti Serena","address_id":"351"},{"id":"1212","name":"Moser Frédy","address_id":"351"},{"id":"1242","name":"Benacka Marek","address_id":"351"},{"id":"1252","name":"Murek Michael Konrad","address_id":"351"},{"id":"1258","name":"Mützenberg Fabiana","address_id":"351"},{"id":"1259","name":"Nabergoj Mitja","address_id":"351"},{"id":"1269","name":"Naiken Surennaidoo Perumal","address_id":"351"},{"id":"1270","name":"Naïmi Roxane Sophie","address_id":"351"},{"id":"1273","name":"Nasce' Alberto","address_id":"351"},{"id":"1276","name":"Nawabi Sultan Sébastien","address_id":"351"},{"id":"1279","name":"Nedelcu Anamaria","address_id":"351"},{"id":"1282","name":"Neftel Cyril Ralf Alexander","address_id":"351"},{"id":"1285","name":"Nencha Umberto","address_id":"351"},{"id":"1288","name":"Benidjer Dahouia","address_id":"351"},{"id":"1289","name":"Benissa Mohamed Rida","address_id":"351"},{"id":"1290","name":"Benkabouche Mohamed","address_id":"351"},{"id":"1293","name":"Nguyen Kim Hoang-Nam","address_id":"351"},{"id":"1304","name":"Benoit Cédric Pascal","address_id":"351"},{"id":"1306","name":"Nikolaou Charalampia","address_id":"351"},{"id":"1309","name":"Noetzlin Sarah Audrey","address_id":"351"},{"id":"1310","name":"Nogueira Loures Vania de Fatima","address_id":"351"},{"id":"1316","name":"Norambuena Julieta Pelagia","address_id":"351"},{"id":"1337","name":"Benzaquen David Haim","address_id":"351"},{"id":"1338","name":"Oderbolz Kevin Jonathan Alexandre","address_id":"351"},{"id":"1340","name":"Oestreicher Charlotte Camille Marie","address_id":"351"},{"id":"1345","name":"Oldani Graziano","address_id":"351"},{"id":"1346","name":"Olela Otis Michel Germain","address_id":"351"},{"id":"1348","name":"Olivier Damien André Bertrand","address_id":"351"},{"id":"1361","name":"Ourahmoune Aïmad Eddine","address_id":"351"},{"id":"1362","name":"Ouvrans Julien","address_id":"351"},{"id":"1367","name":"Bereau Matthieu","address_id":"351"},{"id":"1368","name":"Paccaud Joris Adrien Samuel","address_id":"351"},{"id":"1377","name":"Panchard Marc-Alain","address_id":"351"},{"id":"1382","name":"Pant Samaksha Nath","address_id":"351"},{"id":"1384","name":"Papadimitriou Valentina Camille","address_id":"351"},{"id":"1387","name":"Papanastasiou Athanasios","address_id":"351"},{"id":"1391","name":"Parrat David, Laurent","address_id":"351"},{"id":"1397","name":"Pastene Bruno Daniel Gustave","address_id":"351"},{"id":"1400","name":"Patiny Florentine Jocelyne","address_id":"351"},{"id":"1402","name":"Paulet Junca Georgina","address_id":"351"},{"id":"1410","name":"Pedrazzi Nadine Elisabeth","address_id":"351"},{"id":"1414","name":"Peixoto Oliveira Nelson Augusto","address_id":"351"},{"id":"1416","name":"Pelieu ép. Lamps Iris Agnès Reine","address_id":"351"},{"id":"1419","name":"Pellegrini Elsa","address_id":"351"},{"id":"1420","name":"Pellegrino Martina","address_id":"351"},{"id":"1421","name":"Peloso Andrea","address_id":"351"},{"id":"1422","name":"Pelouze Alexandre Jean","address_id":"351"},{"id":"1423","name":"Pereira Camejo Maricé","address_id":"351"},{"id":"1428","name":"Perret Laurelie","address_id":"351"},{"id":"1433","name":"Perrin Tilman Nicolas Ulrich","address_id":"351"},{"id":"1434","name":"Perrin Julia Axelle","address_id":"351"},{"id":"1446","name":"Petrou Ilias","address_id":"351"},{"id":"1456","name":"Bergougnoux Brice Baptiste","address_id":"351"},{"id":"1458","name":"Picardi Cristina","address_id":"351"},{"id":"1461","name":"Pilichou Eleni","address_id":"351"},{"id":"1466","name":"Podetta Michele","address_id":"351"},{"id":"1467","name":"Poggi Roberto","address_id":"351"},{"id":"1469","name":"Poli Lauriane","address_id":"351"},{"id":"1471","name":"Polito Andrea","address_id":"351"},{"id":"1473","name":"Pollorsi Gaia","address_id":"351"},{"id":"1474","name":"Ponet Loïc Pierre","address_id":"351"},{"id":"1476","name":"Popal Festa Bahar","address_id":"351"},{"id":"1480","name":"Popp Julius Daniel","address_id":"351"},{"id":"1489","name":"Praplan Guillaume Benoit","address_id":"351"},{"id":"1493","name":"Priamo Julien","address_id":"351"},{"id":"1499","name":"Prod'hom Sophie Victoria","address_id":"351"},{"id":"1500","name":"Bernava Gianmarco","address_id":"351"},{"id":"1502","name":"Pugliesi Angela","address_id":"351"},{"id":"1506","name":"Quagliarini Beatrice","address_id":"351"},{"id":"1517","name":"Berney Sylvain Gibus","address_id":"351"},{"id":"1518","name":"Raffoul Toni","address_id":"351"},{"id":"1519","name":"Rahban Charbel","address_id":"351"},{"id":"1531","name":"Ranza Emmanuelle Nathalie","address_id":"351"},{"id":"1532","name":"Bernier Jacques R.F.","address_id":"351"},{"id":"1537","name":"Berquier Guillaume Louis Emile","address_id":"351"},{"id":"1554","name":"Reinmann Marie Aurélie","address_id":"351"},{"id":"1563","name":"Rémy Tristan Louis","address_id":"351"},{"id":"1570","name":"Requejo Rodriguez Elena","address_id":"351"},{"id":"1576","name":"Berthet Tillandsia Adeline Maxence","address_id":"351"},{"id":"1580","name":"Reymond Mattéo Balthazar","address_id":"351"},{"id":"1581","name":"Reymond Philippe Germain","address_id":"351"},{"id":"1582","name":"Reynaud Marine Cyrielle","address_id":"351"},{"id":"1596","name":"Rigumye Lloyd Orphee","address_id":"351"},{"id":"1597","name":"Rilliet Bénédict","address_id":"351"},{"id":"1601","name":"Rinaldi Lara Dafne","address_id":"351"},{"id":"1617","name":"Bertrand Jérome Léo Karim","address_id":"351"},{"id":"1620","name":"Rochat Tamara Séverine","address_id":"351"},{"id":"1622","name":"Rodrigues Gaspar","address_id":"351"},{"id":"1623","name":"Rodriguez Fernandez Maria Julia","address_id":"351"},{"id":"1626","name":"Roggenhofer Elisabeth","address_id":"351"},{"id":"1629","name":"Rohr Marie Madeleine","address_id":"351"},{"id":"1635","name":"Roosendaal Astrid Marijke","address_id":"351"},{"id":"1642","name":"Bessis Anne-Sophie Marie","address_id":"351"},{"id":"1643","name":"Rossitto Mauro","address_id":"351"},{"id":"1653","name":"Roua Elodie Marie","address_id":"351"},{"id":"1655","name":"Rouyer Frederic Jean Roger","address_id":"351"},{"id":"1657","name":"Royston Léna Elisabeth Eva","address_id":"351"},{"id":"1658","name":"Rubbia Brandt Laura","address_id":"351"},{"id":"1660","name":"Rudermann Raquel","address_id":"351"},{"id":"1664","name":"Ruffieux Etienne Romain","address_id":"351"},{"id":"1677","name":"Sabe Michel","address_id":"351"},{"id":"1678","name":"Sabouret Laurence Marie","address_id":"351"},{"id":"1690","name":"Salamoni Myriam","address_id":"351"},{"id":"1693","name":"Salmon Basile Lothaire","address_id":"351"},{"id":"1696","name":"Samara Eleftheria","address_id":"351"},{"id":"1699","name":"Samii Kaveh","address_id":"351"},{"id":"1701","name":"Beyer Katharina","address_id":"351"},{"id":"1702","name":"Sanida Evangelia","address_id":"351"},{"id":"1703","name":"Sanson Nicole","address_id":"351"},{"id":"1704","name":"Sanson Morgane Elise Arielle","address_id":"351"},{"id":"1708","name":"Santos Oliveira Patrique","address_id":"351"},{"id":"1710","name":"Saranti Eva","address_id":"351"},{"id":"1712","name":"Sartorius Danielle, Marie","address_id":"351"},{"id":"1718","name":"Scarpa Cosimo Riccardo","address_id":"351"},{"id":"1728","name":"Schaller Diane Marie Mireille","address_id":"351"},{"id":"1729","name":"Schaller Mathilde","address_id":"351"},{"id":"1742","name":"Bianchi Davide","address_id":"351"},{"id":"1760","name":"Schläpfer Pierre","address_id":"351"},{"id":"1804","name":"Schneider Marie","address_id":"351"},{"id":"1805","name":"Agapitou Eleni","address_id":"351"},{"id":"1806","name":"Schnetz Marc André","address_id":"351"},{"id":"1811","name":"Schoeni Sophie Marie","address_id":"351"},{"id":"1822","name":"Schrumpf David Christian","address_id":"351"},{"id":"1825","name":"Schuhler-Farny Caroline Anne-Marie Monique","address_id":"351"},{"id":"1831","name":"Schumacher Fanny Cassandra","address_id":"351"},{"id":"1832","name":"Bigoni Jérôme Pierre","address_id":"351"},{"id":"1835","name":"Bikye Thérèse Diane","address_id":"351"},{"id":"1845","name":"Schwery Marie","address_id":"351"},{"id":"1849","name":"Sciotto Francesco","address_id":"351"},{"id":"1861","name":"Seipel Amanda Helene Michaelsdotter","address_id":"351"},{"id":"1863","name":"Sekarski-Hunkeler Nicole","address_id":"351"},{"id":"1867","name":"Senchyna Arun François Orson","address_id":"351"},{"id":"1870","name":"Serfaty Emmanuel","address_id":"351"},{"id":"1871","name":"Serir Maryam","address_id":"351"},{"id":"1885","name":"Silva Baticam Nalla","address_id":"351"},{"id":"1896","name":"Singovski Simon","address_id":"351"},{"id":"1905","name":"Sommaruga Samuel Aramis Cornélio","address_id":"351"},{"id":"1908","name":"Soret Guillaume Nicolas Serge","address_id":"351"},{"id":"1909","name":"Soroken Cindy Jan","address_id":"351"},{"id":"1911","name":"Sossauer Laura Marion","address_id":"351"},{"id":"1912","name":"Soudry Sophie Myriam","address_id":"351"},{"id":"1913","name":"Souvatzi Elissavet","address_id":"351"},{"id":"1914","name":"Sowinska Magdalena Maria","address_id":"351"},{"id":"1922","name":"Springer Christina","address_id":"351"},{"id":"1925","name":"Stafuzza Caterina","address_id":"351"},{"id":"1932","name":"Stancu Patrick Jon George","address_id":"351"},{"id":"1939","name":"Stefani Alexandra Laura","address_id":"351"},{"id":"1960","name":"Biver Emmanuel Joseph Gilbert","address_id":"351"},{"id":"1965","name":"Stollar Fabiola","address_id":"351"},{"id":"1968","name":"Stolz Hadrien Hubert Nicolas","address_id":"351"},{"id":"1970","name":"Stormacq Sophie Aline","address_id":"351"},{"id":"1975","name":"Strebel Matthew James","address_id":"351"},{"id":"1982","name":"Blaiberg Samantha Tatiana","address_id":"351"},{"id":"1986","name":"Stuckelberger Yann Luca","address_id":"351"},{"id":"1991","name":"Stuker Nathalie Céline","address_id":"351"},{"id":"2007","name":"Sztajzel Roman Félix","address_id":"351"},{"id":"2008","name":"Tabibian David","address_id":"351"},{"id":"2010","name":"Tabouret Claire Valérie","address_id":"351"},{"id":"2015","name":"Tapparel Ludovic Mathieu","address_id":"351"},{"id":"2018","name":"Blaser Stéphanie Christine","address_id":"351"},{"id":"2023","name":"Taylor Walter Robert John","address_id":"351"},{"id":"2024","name":"Tchepanvo Touohou Guyrette Marius","address_id":"351"},{"id":"2028","name":"Tercier Stéphane Georges","address_id":"351"},{"id":"2029","name":"Teres Castillo Cheryl","address_id":"351"},{"id":"2032","name":"Tessiatore Patrizia","address_id":"351"},{"id":"2033","name":"Testaz Magali Claire","address_id":"351"},{"id":"2042","name":"Thévoz Laurence Delphine","address_id":"351"},{"id":"2046","name":"Thomet Céline","address_id":"351"},{"id":"2059","name":"Tilliette Marie-Ange Georges","address_id":"351"},{"id":"2061","name":"Tirefort Yordanka","address_id":"351"},{"id":"2062","name":"Tissandier Côme","address_id":"351"},{"id":"2064","name":"Tizi Karima","address_id":"351"},{"id":"2067","name":"Todoran Dana","address_id":"351"},{"id":"2068","name":"Todorovic Tania","address_id":"351"},{"id":"2074","name":"Toso Seema","address_id":"351"},{"id":"2089","name":"Trigui Nader","address_id":"351"},{"id":"2090","name":"Triolo Julie Coralie","address_id":"351"},{"id":"2101","name":"Tsouni Pinelopi","address_id":"351"},{"id":"2105","name":"Tulvan Georgiana","address_id":"351"},{"id":"2114","name":"Uginet Marjolaine Flore Catherine","address_id":"351"},{"id":"2124","name":"Urner Esther Aïsha","address_id":"351"},{"id":"2132","name":"Valpaços Magalhaes Ana Catarina","address_id":"351"},{"id":"2133","name":"van der Bent Pauline Léa","address_id":"351"},{"id":"2135","name":"Ahrendts Ulrike Annette","address_id":"351"},{"id":"2137","name":"Vanden Eynden Xavier Pierre","address_id":"351"},{"id":"2139","name":"Vannespenne Damien Cyrille Julien","address_id":"351"},{"id":"2141","name":"Varvagiannis Konstantinos","address_id":"351"},{"id":"2142","name":"Vasilakou Evgenia","address_id":"351"},{"id":"2144","name":"Böcher Lena Katharina","address_id":"351"},{"id":"2145","name":"Vaz Madera Rachel Isabelle","address_id":"351"},{"id":"2146","name":"Vecera Domenico","address_id":"351"},{"id":"2147","name":"Vecsernyés Noémie Boglarka","address_id":"351"},{"id":"2156","name":"Vermeille Matthieu Louis Ernest Pierre","address_id":"351"},{"id":"2162","name":"Bocksberger Jean-Philippe","address_id":"351"},{"id":"2165","name":"Villa Fabio","address_id":"351"},{"id":"2167","name":"Villeneuve Delphine Marie Suzanne Francine","address_id":"351"},{"id":"2175","name":"Vochtchinina Nadejda","address_id":"351"},{"id":"2185","name":"Voirol Ulysse Hubert Jean","address_id":"351"},{"id":"2190","name":"von Düring Stephan Detlef Robert","address_id":"351"},{"id":"2194","name":"von Rohr Cécilia Marie Eugénie","address_id":"351"},{"id":"2195","name":"von Schnakenburg Leona Fee Valentine","address_id":"351"},{"id":"2200","name":"Voreopoulou Thaleia","address_id":"351"},{"id":"2206","name":"Wacker Bou Puigdefabregas Julie Caroline","address_id":"351"},{"id":"2209","name":"Waeber Baptiste","address_id":"351"},{"id":"2227","name":"Walter Caroline","address_id":"351"},{"id":"2230","name":"Wanders Aurélie Jacqueline Barbara","address_id":"351"},{"id":"2231","name":"Wanyanga Pierre Mwito","address_id":"351"},{"id":"2238","name":"Wegelius Helena Patricia","address_id":"351"},{"id":"2244","name":"Weinberger Andreas Willi Adolf","address_id":"351"},{"id":"2262","name":"Akaâboune Mohammed","address_id":"351"},{"id":"2265","name":"Bolli Lucie","address_id":"351"},{"id":"2284","name":"Windisch Olivier Laurent","address_id":"351"},{"id":"2291","name":"Wiseman Ashley Xavérine","address_id":"351"},{"id":"2306","name":"Wozniak Hannah Gail Meredith","address_id":"351"},{"id":"2307","name":"Wuarin Raphaël Laurent","address_id":"351"},{"id":"2308","name":"Wuillemin Timothée","address_id":"351"},{"id":"2319","name":"Xheladini Imrane","address_id":"351"},{"id":"2321","name":"Yan David Jun","address_id":"351"},{"id":"2327","name":"Yue Tilman Christoph","address_id":"351"},{"id":"2331","name":"Akkawi Mohamed Fayez","address_id":"351"},{"id":"2362","name":"Zucchello Stephanie Zoe Augusta","address_id":"351"},{"id":"2367","name":"Zumkehr Julien Frédy","address_id":"351"},{"id":"2379","name":"Bordry Natacha Anne-Sophie","address_id":"351"},{"id":"2381","name":"Borgeaud Simon Gaspard","address_id":"351"},{"id":"2385","name":"Al Hadi Pierre Adam","address_id":"351"},{"id":"2395","name":"Alalwan Heba Aladin Abdulsahib","address_id":"351"},{"id":"2401","name":"Boucher Astrid Linda","address_id":"351"},{"id":"2402","name":"Bouchez Laurie Denise Jeanne","address_id":"351"},{"id":"2403","name":"Boudabbous Sana","address_id":"351"},{"id":"2404","name":"Boughanem Nihed","address_id":"351"},{"id":"2405","name":"Boukakiou Reda Hossein","address_id":"351"},{"id":"2406","name":"Bounaix Laura Hélène","address_id":"351"},{"id":"2407","name":"Bourezg Ali","address_id":"351"},{"id":"2408","name":"Bourquin Carole","address_id":"351"},{"id":"2409","name":"Bouzelmat Fairouz","address_id":"351"},{"id":"2422","name":"Braye Eilena Vanessa Roselyne","address_id":"351"},{"id":"2423","name":"Alberto Chloé Julie","address_id":"351"},{"id":"2424","name":"Bréchet Bachmann Anne-Claire Erica","address_id":"351"},{"id":"2428","name":"Breitenstein Alexandra Marie","address_id":"351"},{"id":"2438","name":"Brönnimann Enrico","address_id":"351"},{"id":"2439","name":"Brossard Philippe Claude","address_id":"351"},{"id":"2450","name":"Alcouce Eduardo","address_id":"351"},{"id":"2451","name":"Brunner Alexandrine Marie Eléa","address_id":"351"},{"id":"2453","name":"Alec Milena Sophia","address_id":"351"},{"id":"2457","name":"Buchs Elisa Myriam","address_id":"351"},{"id":"2461","name":"Buffle Camille Leyla Aude","address_id":"351"},{"id":"2471","name":"Burgan Hania Carina","address_id":"351"},{"id":"2472","name":"Burgan Ryan","address_id":"351"},{"id":"2474","name":"Burgermeister Simon Jules Eric","address_id":"351"},{"id":"2491","name":"Abed Fatiha","address_id":"351"},{"id":"2493","name":"Butticci Roberta","address_id":"351"},{"id":"2502","name":"Camail Roxane","address_id":"351"},{"id":"2504","name":"Allievi Claire Jeanne","address_id":"351"},{"id":"2506","name":"Campiche Sarah","address_id":"351"},{"id":"2508","name":"Cantero Chloé Candice","address_id":"351"},{"id":"2512","name":"Capanna Federica","address_id":"351"},{"id":"2514","name":"Caronni Guido Marco","address_id":"351"},{"id":"2521","name":"Alt Alexandre Pierre Eugène","address_id":"351"},{"id":"2522","name":"Caspari Maud Alexandra","address_id":"351"},{"id":"2524","name":"Castro Julie Anne","address_id":"351"},{"id":"2525","name":"Castro Reina Daniel","address_id":"351"},{"id":"2527","name":"Catho Gaud Marie Catherine","address_id":"351"},{"id":"2532","name":"Cediel Canals Maria Lucia","address_id":"351"},{"id":"2538","name":"Ceruti Samuele","address_id":"351"},{"id":"2542","name":"Chacowry Komal Rachna","address_id":"351"},{"id":"2544","name":"Chamot Nicolas Christian Marie","address_id":"351"},{"id":"2546","name":"Chappalley Dimitri","address_id":"351"},{"id":"2550","name":"Charalampous Nikolaos","address_id":"351"},{"id":"2552","name":"Chatelanat Olivier","address_id":"351"},{"id":"2555","name":"Chauvet-Gelinier Jean-Christophe Paul","address_id":"351"},{"id":"2563","name":"Chevallier Claire Germaine Marthe Constance","address_id":"351"},{"id":"2566","name":"Chevrier Raphaël David","address_id":"351"},{"id":"2567","name":"Chiabotto Chiara","address_id":"351"},{"id":"2569","name":"Chiesa Olivier Franck","address_id":"351"},{"id":"2570","name":"Chiesa Sarah Carla Elisa","address_id":"351"},{"id":"2571","name":"Chieze Marie","address_id":"351"},{"id":"2592","name":"Coassolo Patrice Jérôme","address_id":"351"},{"id":"2593","name":"Cole Pierre Louis Matthieu","address_id":"351"},{"id":"2594","name":"Colinet Emilie Marie-Lou","address_id":"351"},{"id":"2595","name":"Compagnon Philippe Lucien","address_id":"351"},{"id":"2603","name":"Cools Evelien","address_id":"351"},{"id":"2604","name":"Copercini Michele","address_id":"351"},{"id":"2605","name":"Coppens Elia Willy Yvonne","address_id":"351"},{"id":"2607","name":"Cordier Maria","address_id":"351"},{"id":"2609","name":"Corigliano Teresa","address_id":"351"},{"id":"2612","name":"Coste Christophe Christian Eudes","address_id":"351"},{"id":"2613","name":"Coste Florence Chantal Julie","address_id":"351"},{"id":"2615","name":"Craviari Cecilia","address_id":"351"},{"id":"2616","name":"Cristallo Lacalamita Marirosa","address_id":"351"},{"id":"2622","name":"Cunningham Sophie Dora","address_id":"351"},{"id":"2623","name":"Cuvelier Clémence Marie","address_id":"351"},{"id":"2625","name":"Da Graca Vera Cruz Mandinga Silésia Nuria","address_id":"351"},{"id":"2627","name":"Da Silva Costa Gonçalves Rato Veronica Luisa","address_id":"351"},{"id":"2628","name":"Da Silva Matos Ferreira Pedro Antonio","address_id":"351"},{"id":"2633","name":"D'Andrea Francesco","address_id":"351"},{"id":"2634","name":"d'Andréa Alexia","address_id":"351"},{"id":"2637","name":"Dash Jonathan","address_id":"351"},{"id":"2638","name":"Dash Jérémy","address_id":"351"},{"id":"2644","name":"Dayal Nicolas Benjamin","address_id":"351"},{"id":"2645","name":"Dayer Julie-Anne","address_id":"351"},{"id":"2646","name":"Dayer Maud-Laure","address_id":"351"},{"id":"2649","name":"De Bodman ép. Launay Charlotte Marie Brigitte","address_id":"351"},{"id":"2650","name":"de Buys Roessingh Anthony Stephan","address_id":"351"},{"id":"2654","name":"de Charrière Amandine Solange Marie","address_id":"351"},{"id":"2658","name":"de Lorenzi Caroline Marie","address_id":"351"},{"id":"2659","name":"de Massougnes des Fontaines Sophie Charlotte Elsa","address_id":"351"},{"id":"2660","name":"De Mesmaeker Stéphanie Joëlle Sabine","address_id":"351"},{"id":"2661","name":"De Oliveira Lourenco Joao Carlos","address_id":"351"},{"id":"2664","name":"De Ramon Ortiz Carmen Julia","address_id":"351"},{"id":"2666","name":"de Sousa Sandra Cristina","address_id":"351"},{"id":"2668","name":"Deac Monica-Oana","address_id":"351"},{"id":"2672","name":"Decrombecque Thibaut Louis François","address_id":"351"},{"id":"2674","name":"Amstutz Sébastien Alexandre","address_id":"351"},{"id":"2680","name":"Deligianni Marianthi Lousiana Symeonia","address_id":"351"},{"id":"2685","name":"Delmarre Emmanuelle Seema","address_id":"351"},{"id":"2687","name":"Anastasiou Maria","address_id":"351"},{"id":"2690","name":"Demirtas Ezgi Dilek","address_id":"351"},{"id":"2691","name":"Denis Antoine Fabrice","address_id":"351"},{"id":"2693","name":"Anci Eleonora","address_id":"351"},{"id":"2695","name":"Descloux Emilienne Eugénie Antoinette","address_id":"351"},{"id":"2698","name":"Devillé Cédric André M","address_id":"351"},{"id":"2700","name":"Dhouib ép. Chargui Amira","address_id":"351"},{"id":"2712","name":"Anderson De La Llana Rebecca","address_id":"351"},{"id":"2719","name":"Djakovic ép. Todic Tanja","address_id":"351"}],"relationships":[{"from_person_id":"17","to_person_id":"414","edge_weight":"1","connection_type":"1"},{"from_person_id":"17","to_person_id":"1391","edge_weight":"1","connection_type":"1"},{"from_person_id":"17","to_person_id":"2308","edge_weight":"1","connection_type":"1"},{"from_person_id":"41","to_person_id":"1458","edge_weight":"1","connection_type":"1"},{"from_person_id":"44","to_person_id":"414","edge_weight":"1","connection_type":"1"},{"from_person_id":"50","to_person_id":"216","edge_weight":"1","connection_type":"1"},{"from_person_id":"150","to_person_id":"886","edge_weight":"1","connection_type":"1"},{"from_person_id":"216","to_person_id":"50","edge_weight":"1","connection_type":"1"},{"from_person_id":"279","to_person_id":"1202","edge_weight":"3","connection_type":"1"},{"from_person_id":"279","to_person_id":"1345","edge_weight":"1","connection_type":"1"},{"from_person_id":"414","to_person_id":"17","edge_weight":"1","connection_type":"1"},{"from_person_id":"414","to_person_id":"44","edge_weight":"1","connection_type":"1"},{"from_person_id":"414","to_person_id":"1391","edge_weight":"1","connection_type":"1"},{"from_person_id":"481","to_person_id":"1202","edge_weight":"1","connection_type":"1"},{"from_person_id":"540","to_person_id":"1658","edge_weight":"1","connection_type":"1"},{"from_person_id":"540","to_person_id":"1699","edge_weight":"3","connection_type":"1"},{"from_person_id":"560","to_person_id":"2008","edge_weight":"4","connection_type":"1"},{"from_person_id":"611","to_person_id":"1202","edge_weight":"10","connection_type":"1"},{"from_person_id":"661","to_person_id":"2320","edge_weight":"3","connection_type":"1"},{"from_person_id":"820","to_person_id":"1458","edge_weight":"1","connection_type":"1"},{"from_person_id":"886","to_person_id":"150","edge_weight":"1","connection_type":"1"},{"from_person_id":"985","to_person_id":"1696","edge_weight":"1","connection_type":"1"},{"from_person_id":"1077","to_person_id":"1699","edge_weight":"2","connection_type":"1"},{"from_person_id":"1077","to_person_id":"2061","edge_weight":"4","connection_type":"1"},{"from_person_id":"1202","to_person_id":"279","edge_weight":"3","connection_type":"1"},{"from_person_id":"1202","to_person_id":"481","edge_weight":"1","connection_type":"1"},{"from_person_id":"1202","to_person_id":"611","edge_weight":"10","connection_type":"1"},{"from_person_id":"1202","to_person_id":"1345","edge_weight":"14","connection_type":"1"},{"from_person_id":"1202","to_person_id":"1466","edge_weight":"1","connection_type":"1"},{"from_person_id":"1202","to_person_id":"1518","edge_weight":"2","connection_type":"1"},{"from_person_id":"1202","to_person_id":"1658","edge_weight":"21","connection_type":"1"},{"from_person_id":"1202","to_person_id":"1718","edge_weight":"2","connection_type":"1"},{"from_person_id":"1345","to_person_id":"279","edge_weight":"1","connection_type":"1"},{"from_person_id":"1345","to_person_id":"1202","edge_weight":"14","connection_type":"1"},{"from_person_id":"1345","to_person_id":"1421","edge_weight":"3","connection_type":"1"},{"from_person_id":"1345","to_person_id":"1658","edge_weight":"4","connection_type":"1"},{"from_person_id":"1352","to_person_id":"1658","edge_weight":"1","connection_type":"1"},{"from_person_id":"1391","to_person_id":"17","edge_weight":"1","connection_type":"1"},{"from_person_id":"1391","to_person_id":"414","edge_weight":"1","connection_type":"1"},{"from_person_id":"1421","to_person_id":"1345","edge_weight":"3","connection_type":"1"},{"from_person_id":"1458","to_person_id":"41","edge_weight":"1","connection_type":"1"},{"from_person_id":"1458","to_person_id":"820","edge_weight":"1","connection_type":"1"},{"from_person_id":"1466","to_person_id":"1202","edge_weight":"1","connection_type":"1"},{"from_person_id":"1518","to_person_id":"1202","edge_weight":"2","connection_type":"1"},{"from_person_id":"1658","to_person_id":"540","edge_weight":"1","connection_type":"1"},{"from_person_id":"1658","to_person_id":"1202","edge_weight":"21","connection_type":"1"},{"from_person_id":"1658","to_person_id":"1345","edge_weight":"4","connection_type":"1"},{"from_person_id":"1658","to_person_id":"1352","edge_weight":"1","connection_type":"1"},{"from_person_id":"1696","to_person_id":"985","edge_weight":"1","connection_type":"1"},{"from_person_id":"1697","to_person_id":"2320","edge_weight":"1","connection_type":"1"},{"from_person_id":"1697","to_person_id":"2339","edge_weight":"1","connection_type":"1"},{"from_person_id":"1699","to_person_id":"540","edge_weight":"3","connection_type":"1"},{"from_person_id":"1699","to_person_id":"1077","edge_weight":"2","connection_type":"1"},{"from_person_id":"1699","to_person_id":"2061","edge_weight":"2","connection_type":"1"},{"from_person_id":"1699","to_person_id":"2645","edge_weight":"1","connection_type":"1"},{"from_person_id":"1718","to_person_id":"1202","edge_weight":"2","connection_type":"1"},{"from_person_id":"2008","to_person_id":"560","edge_weight":"4","connection_type":"1"},{"from_person_id":"2061","to_person_id":"1077","edge_weight":"4","connection_type":"1"},{"from_person_id":"2061","to_person_id":"1699","edge_weight":"2","connection_type":"1"},{"from_person_id":"2074","to_person_id":"2403","edge_weight":"1","connection_type":"1"},{"from_person_id":"2074","to_person_id":"2616","edge_weight":"1","connection_type":"1"},{"from_person_id":"2308","to_person_id":"17","edge_weight":"1","connection_type":"1"},{"from_person_id":"2320","to_person_id":"661","edge_weight":"3","connection_type":"1"},{"from_person_id":"2320","to_person_id":"1697","edge_weight":"1","connection_type":"1"},{"from_person_id":"2339","to_person_id":"1697","edge_weight":"1","connection_type":"1"},{"from_person_id":"2403","to_person_id":"2074","edge_weight":"1","connection_type":"1"},{"from_person_id":"2616","to_person_id":"2074","edge_weight":"1","connection_type":"1"},{"from_person_id":"2645","to_person_id":"1699","edge_weight":"1","connection_type":"1"},{"from_person_id":"44","to_person_id":"414","edge_weight":"10","connection_type":"2"},{"from_person_id":"379","to_person_id":"178","edge_weight":"1","connection_type":"2"},{"from_person_id":"540","to_person_id":"1202","edge_weight":"19","connection_type":"2"},{"from_person_id":"540","to_person_id":"1658","edge_weight":"13","connection_type":"2"},{"from_person_id":"540","to_person_id":"1699","edge_weight":"4","connection_type":"2"},{"from_person_id":"560","to_person_id":"2008","edge_weight":"4","connection_type":"2"},{"from_person_id":"611","to_person_id":"1202","edge_weight":"104","connection_type":"2"},{"from_person_id":"616","to_person_id":"414","edge_weight":"3","connection_type":"2"},{"from_person_id":"616","to_person_id":"600","edge_weight":"7","connection_type":"2"},{"from_person_id":"661","to_person_id":"2320","edge_weight":"7","connection_type":"2"},{"from_person_id":"740","to_person_id":"921","edge_weight":"2","connection_type":"2"},{"from_person_id":"1077","to_person_id":"2061","edge_weight":"2","connection_type":"2"},{"from_person_id":"1202","to_person_id":"611","edge_weight":"209","connection_type":"2"},{"from_person_id":"1202","to_person_id":"689","edge_weight":"2","connection_type":"2"},{"from_person_id":"1202","to_person_id":"1345","edge_weight":"51","connection_type":"2"},{"from_person_id":"1202","to_person_id":"1658","edge_weight":"132","connection_type":"2"},{"from_person_id":"1345","to_person_id":"1202","edge_weight":"116","connection_type":"2"},{"from_person_id":"1345","to_person_id":"1658","edge_weight":"33","connection_type":"2"},{"from_person_id":"1466","to_person_id":"611","edge_weight":"17","connection_type":"2"},{"from_person_id":"1466","to_person_id":"1202","edge_weight":"32","connection_type":"2"},{"from_person_id":"1658","to_person_id":"540","edge_weight":"8","connection_type":"2"},{"from_person_id":"1658","to_person_id":"823","edge_weight":"5","connection_type":"2"},{"from_person_id":"1658","to_person_id":"1202","edge_weight":"152","connection_type":"2"},{"from_person_id":"1658","to_person_id":"1345","edge_weight":"26","connection_type":"2"},{"from_person_id":"1699","to_person_id":"540","edge_weight":"5","connection_type":"2"},{"from_person_id":"2008","to_person_id":"560","edge_weight":"20","connection_type":"2"},{"from_person_id":"2061","to_person_id":"1077","edge_weight":"2","connection_type":"2"},{"from_person_id":"2320","to_person_id":"661","edge_weight":"10","connection_type":"2"}],"workers":[{"id":"552","name":"Balli-Antunes Mariette Filomena","address_id":"77","workerType":"Physician"},{"id":"1294","name":"Nguyen-Tran Bich Quyen","address_id":"77","workerType":"Physician"},{"id":"2004","name":"Sutter Alain-André","address_id":"77","workerType":"Physician"},{"id":"2130","name":"Valla-Simon Sophie","address_id":"77","workerType":"Physician"},{"id":"2320","name":"YAN Pu","address_id":"77","workerType":"Physician"},{"id":"2679","name":"Anani Prosper","address_id":"77","workerType":"Physician"},{"id":"1440","name":"Pescia Graziano","address_id":"84","workerType":"Physician"},{"id":"35","name":"Ducharne Jacques Jean-Louis Edouard","address_id":"86","workerType":"Physician"},{"id":"350","name":"Glauser Frédéric André","address_id":"86","workerType":"Physician"},{"id":"791","name":"Adatto Maurice","address_id":"86","workerType":"Physician"},{"id":"1065","name":"Marangon-Rosay Anne Claire","address_id":"86","workerType":"Physician"},{"id":"1144","name":"Merminod Thierry Roland Ernest","address_id":"86","workerType":"Physician"},{"id":"1183","name":"Mock Pascal Michel","address_id":"86","workerType":"Physician"},{"id":"1263","name":"NAFTANAILA Eugen","address_id":"86","workerType":"Physician"},{"id":"1352","name":"Oppliger Roland","address_id":"86","workerType":"Physician"},{"id":"2148","name":"Vento Bosch Cristina","address_id":"86","workerType":"Physician"},{"id":"2682","name":"Della Torre Rocco Carlo Riccardo","address_id":"86","workerType":"Physician"},{"id":"158","name":"Fasnacht Katrin","address_id":"134","workerType":"Physician"},{"id":"286","name":"Gämperli Oliver","address_id":"134","workerType":"Physician"},{"id":"351","name":"Gligorijevic Slobodan","address_id":"134","workerType":"Physician"},{"id":"397","name":"Grossmann Imke","address_id":"134","workerType":"Physician"},{"id":"580","name":"Hug Brennwald Maja Isabel","address_id":"134","workerType":"Physician"},{"id":"598","name":"Baltsavias Gerasimos","address_id":"134","workerType":"Physician"},{"id":"662","name":"Barandun Jürg","address_id":"134","workerType":"Physician"},{"id":"823","name":"Kovári Helen","address_id":"134","workerType":"Physician"},{"id":"844","name":"Kuchen Natalie Leila","address_id":"134","workerType":"Physician"},{"id":"846","name":"Küest Silke Maria","address_id":"134","workerType":"Physician"},{"id":"1019","name":"Lüthi Ursus","address_id":"134","workerType":"Physician"},{"id":"1054","name":"Mamisch Nadja","address_id":"134","workerType":"Physician"},{"id":"1478","name":"Popov Vladimir","address_id":"134","workerType":"Physician"},{"id":"1555","name":"Reisch Robert Arnold","address_id":"134","workerType":"Physician"},{"id":"1558","name":"Reitz Andre","address_id":"134","workerType":"Physician"},{"id":"1561","name":"Remmen Friederike Christine","address_id":"134","workerType":"Physician"},{"id":"1569","name":"Renner Christoph Robert","address_id":"134","workerType":"Physician"},{"id":"1634","name":"Romero José Bartolomé","address_id":"134","workerType":"Physician"},{"id":"1697","name":"Samaras Panagiotis","address_id":"134","workerType":"Physician"},{"id":"1746","name":"Scherer Thomas","address_id":"134","workerType":"Physician"},{"id":"1858","name":"Seiler Daniel","address_id":"134","workerType":"Physician"},{"id":"1873","name":"Serra Andreas Lucas","address_id":"134","workerType":"Physician"},{"id":"1888","name":"Simmen Beat R.","address_id":"134","workerType":"Physician"},{"id":"1917","name":"Speiser Karl","address_id":"134","workerType":"Physician"},{"id":"1927","name":"Stähelin Annina Elisabeth Deborah","address_id":"134","workerType":"Physician"},{"id":"1957","name":"Stocker Reto","address_id":"134","workerType":"Physician"},{"id":"2104","name":"Tüller Claudia, Charlotte","address_id":"134","workerType":"Physician"},{"id":"2106","name":"Tuor Christoph Johannes","address_id":"134","workerType":"Physician"},{"id":"2296","name":"Woernle Christoph Michael","address_id":"134","workerType":"Physician"},{"id":"2339","name":"Zeitz Jonas","address_id":"134","workerType":"Physician"},{"id":"2387","name":"Borovac-Alfirevic Mirela","address_id":"134","workerType":"Physician"},{"id":"2716","name":"Dindo Daniel Ralph","address_id":"134","workerType":"Physician"},{"id":"4","name":"Dolcan Ana-Maria","address_id":"351","workerType":"Physician"},{"id":"7","name":"Domenichini Giulia","address_id":"351","workerType":"Physician"},{"id":"11","name":"Donner Viviane Pascale","address_id":"351","workerType":"Physician"},{"id":"17","name":"DOS SANTOS BRAGANçA Angel","address_id":"351","workerType":"Physician"},{"id":"18","name":"Dos Santos Rocha André Alexandre","address_id":"351","workerType":"Physician"},{"id":"20","name":"Dosso André","address_id":"351","workerType":"Physician"},{"id":"22","name":"Andrey Véronique","address_id":"351","workerType":"Physician"},{"id":"24","name":"Drakul Aneta","address_id":"351","workerType":"Physician"},{"id":"28","name":"Drepper Michael David","address_id":"351","workerType":"Physician"},{"id":"30","name":"Dromzée Eric","address_id":"351","workerType":"Physician"},{"id":"32","name":"Andrieu ép. Vidal Isabelle Genevieve Simone","address_id":"351","workerType":"Physician"},{"id":"33","name":"Dubois Natacha Yasmine Sonia","address_id":"351","workerType":"Physician"},{"id":"34","name":"Dubouchet Laetitia Claudia","address_id":"351","workerType":"Physician"},{"id":"37","name":"Dufey Anne Béatrice","address_id":"351","workerType":"Physician"},{"id":"40","name":"Dugas Sarah Gina","address_id":"351","workerType":"Physician"},{"id":"41","name":"Dulguerov Nicolas","address_id":"351","workerType":"Physician"},{"id":"43","name":"Dumont Céline Françoise","address_id":"351","workerType":"Physician"},{"id":"44","name":"Dumont Shireen","address_id":"351","workerType":"Physician"},{"id":"50","name":"Dupraz Jean","address_id":"351","workerType":"Physician"},{"id":"51","name":"Dupuis Laurent Olivier","address_id":"351","workerType":"Physician"},{"id":"58","name":"Dusser ép. Benesty Perrine Annick Gabrielle","address_id":"351","workerType":"Physician"},{"id":"62","name":"Duxbury Beatrice Jane","address_id":"351","workerType":"Physician"},{"id":"63","name":"Duyck Céline","address_id":"351","workerType":"Physician"},{"id":"73","name":"Eckers Franziska","address_id":"351","workerType":"Physician"},{"id":"75","name":"Eddy Christine Elena","address_id":"351","workerType":"Physician"},{"id":"82","name":"Egger Coraline Lily","address_id":"351","workerType":"Physician"},{"id":"94","name":"Eichler David Paul","address_id":"351","workerType":"Physician"},{"id":"97","name":"Ansaldi Yveline Janine","address_id":"351","workerType":"Physician"},{"id":"110","name":"El Mestikawy Yousri","address_id":"351","workerType":"Physician"},{"id":"113","name":"ANSORGE Alexandre","address_id":"351","workerType":"Physician"},{"id":"127","name":"Eshmawey Mohamed Ahmed Morsy","address_id":"351","workerType":"Physician"},{"id":"128","name":"Espa Cervena Katerina","address_id":"351","workerType":"Physician"},{"id":"129","name":"Espinosa Laila","address_id":"351","workerType":"Physician"},{"id":"134","name":"Etemadi Quddus","address_id":"351","workerType":"Physician"},{"id":"135","name":"ETIENNE Léonard Marc Denis","address_id":"351","workerType":"Physician"},{"id":"141","name":"Evdokimova Anna","address_id":"351","workerType":"Physician"},{"id":"144","name":"Excoffier Sophie","address_id":"351","workerType":"Physician"},{"id":"150","name":"Falco Teresa","address_id":"351","workerType":"Physician"},{"id":"156","name":"Farhat Nesrine","address_id":"351","workerType":"Physician"},{"id":"163","name":"Favre Melody","address_id":"351","workerType":"Physician"},{"id":"164","name":"Favre Thibault Julien Philippe","address_id":"351","workerType":"Physician"},{"id":"166","name":"Araeipour-Tehrani Yasha","address_id":"351","workerType":"Physician"},{"id":"170","name":"Felice-Civitillo Cristina","address_id":"351","workerType":"Physician"},{"id":"172","name":"Félix Garance Lydie","address_id":"351","workerType":"Physician"},{"id":"176","name":"Fernex Lucie Odette","address_id":"351","workerType":"Physician"},{"id":"178","name":"Ferraro Flavia","address_id":"351","workerType":"Physician"},{"id":"179","name":"Ferreira Branco David","address_id":"351","workerType":"Physician"},{"id":"180","name":"Ferreira Viveiros Tavares Dos Reis Andreia Maria","address_id":"351","workerType":"Physician"},{"id":"184","name":"Arellano Osorio Mauricio Jose","address_id":"351","workerType":"Physician"},{"id":"197","name":"Fleury Vanessa Myriam","address_id":"351","workerType":"Physician"},{"id":"200","name":"Flory Samartino Jonathan Marc","address_id":"351","workerType":"Physician"},{"id":"209","name":"Foletti Jean-Marc Louis Aimé","address_id":"351","workerType":"Physician"},{"id":"211","name":"Folino David","address_id":"351","workerType":"Physician"},{"id":"212","name":"Fontaine Laura Claudine","address_id":"351","workerType":"Physician"},{"id":"216","name":"Forte Marques Ana Rita","address_id":"351","workerType":"Physician"},{"id":"220","name":"Fotea Nicoleta-Monica","address_id":"351","workerType":"Physician"},{"id":"226","name":"Franchin Julien","address_id":"351","workerType":"Physician"},{"id":"232","name":"Frassati Dominique Louise Lucie","address_id":"351","workerType":"Physician"},{"id":"238","name":"Arnoux Grégoire","address_id":"351","workerType":"Physician"},{"id":"244","name":"Friedli Axel François Pascal","address_id":"351","workerType":"Physician"},{"id":"249","name":"Frisk Antti Oskari","address_id":"351","workerType":"Physician"},{"id":"250","name":"Frisone Daniele","address_id":"351","workerType":"Physician"},{"id":"254","name":"Froidevaux Mathias Joël","address_id":"351","workerType":"Physician"},{"id":"255","name":"Fructuoso Castellar Ana","address_id":"351","workerType":"Physician"},{"id":"257","name":"Frund Chloé","address_id":"351","workerType":"Physician"},{"id":"276","name":"Gaignard Marie-Estelle Nicole","address_id":"351","workerType":"Physician"},{"id":"278","name":"Galati Romina","address_id":"351","workerType":"Physician"},{"id":"279","name":"Assalino Michela","address_id":"351","workerType":"Physician"},{"id":"283","name":"Assandri Francesca","address_id":"351","workerType":"Physician"},{"id":"284","name":"Galova Andrea","address_id":"351","workerType":"Physician"},{"id":"290","name":"Gantcheva Neli","address_id":"351","workerType":"Physician"},{"id":"296","name":"Garelli Valentina","address_id":"351","workerType":"Physician"},{"id":"299","name":"Gassend Jean-Loup Clarence Aimé","address_id":"351","workerType":"Physician"},{"id":"315","name":"Auberson Lucille","address_id":"351","workerType":"Physician"},{"id":"318","name":"Aubin Paul-Alexandre Louis Claude Tuan Anh","address_id":"351","workerType":"Physician"},{"id":"319","name":"Genoud Mathieu","address_id":"351","workerType":"Physician"},{"id":"322","name":"Georgescu Daniela","address_id":"351","workerType":"Physician"},{"id":"324","name":"Gerber Annick Olivia","address_id":"351","workerType":"Physician"},{"id":"325","name":"Achard Vérane Maud Marguerite","address_id":"351","workerType":"Physician"},{"id":"331","name":"Ghinescu Ana Maria","address_id":"351","workerType":"Physician"},{"id":"332","name":"GHITA Stefana Maria","address_id":"351","workerType":"Physician"},{"id":"335","name":"Giannotti Federica","address_id":"351","workerType":"Physician"},{"id":"339","name":"Gigon Anthony","address_id":"351","workerType":"Physician"},{"id":"341","name":"Giovannoni Laurianne Santa","address_id":"351","workerType":"Physician"},{"id":"342","name":"Girardet Anne Caroline","address_id":"351","workerType":"Physician"},{"id":"343","name":"Girod Pierre-Pascal","address_id":"351","workerType":"Physician"},{"id":"345","name":"Gkikopoulos Nikitas","address_id":"351","workerType":"Physician"},{"id":"346","name":"Gkotsoulia Christina","address_id":"351","workerType":"Physician"},{"id":"347","name":"Gkrezios Apostolos","address_id":"351","workerType":"Physician"},{"id":"348","name":"Glanz Ludovic Georges","address_id":"351","workerType":"Physician"},{"id":"356","name":"Gobitz Michaël Charles-Henri Serge","address_id":"351","workerType":"Physician"},{"id":"358","name":"Godet Tony Aldo","address_id":"351","workerType":"Physician"},{"id":"361","name":"Gomaa Dalia","address_id":"351","workerType":"Physician"},{"id":"362","name":"Gomez Parada Karina Alexandra","address_id":"351","workerType":"Physician"},{"id":"373","name":"Grabherr Silke","address_id":"351","workerType":"Physician"},{"id":"379","name":"Gramatica Luca","address_id":"351","workerType":"Physician"},{"id":"380","name":"Grandjean Alexandre","address_id":"351","workerType":"Physician"},{"id":"381","name":"Grandoni Francesco Luca","address_id":"351","workerType":"Physician"},{"id":"382","name":"Granieri Carla","address_id":"351","workerType":"Physician"},{"id":"405","name":"Gschwind Markus Andreas","address_id":"351","workerType":"Physician"},{"id":"406","name":"Gubana Francesca","address_id":"351","workerType":"Physician"},{"id":"408","name":"Guber Ivo","address_id":"351","workerType":"Physician"},{"id":"411","name":"Guedj Noémie Olivia","address_id":"351","workerType":"Physician"},{"id":"412","name":"Guélat Quentin Simon","address_id":"351","workerType":"Physician"},{"id":"413","name":"Guemara Romain Jan","address_id":"351","workerType":"Physician"},{"id":"414","name":"Guessous Idris","address_id":"351","workerType":"Physician"},{"id":"423","name":"Guillaume-Gentil Simon Bertrand","address_id":"351","workerType":"Physician"},{"id":"424","name":"Guillermin Alexandre Andrea","address_id":"351","workerType":"Physician"},{"id":"425","name":"Guinand Nils Olivier","address_id":"351","workerType":"Physician"},{"id":"431","name":"Gurbanov Elvin","address_id":"351","workerType":"Physician"},{"id":"436","name":"Bachofner Christelle","address_id":"351","workerType":"Physician"},{"id":"452","name":"Hammer Nathalie Gabrielle","address_id":"351","workerType":"Physician"},{"id":"457","name":"Hannouche Didier Zakaria","address_id":"351","workerType":"Physician"},{"id":"460","name":"Harding Sonya Natalie","address_id":"351","workerType":"Physician"},{"id":"481","name":"Bagetakos Ilias","address_id":"351","workerType":"Physician"},{"id":"483","name":"Hayek Georges","address_id":"351","workerType":"Physician"},{"id":"490","name":"Bahadori Atessa","address_id":"351","workerType":"Physician"},{"id":"499","name":"Hensen Maxime","address_id":"351","workerType":"Physician"},{"id":"507","name":"Herpe Guillaume Jean Marie","address_id":"351","workerType":"Physician"},{"id":"510","name":"Herrera Bruno","address_id":"351","workerType":"Physician"},{"id":"537","name":"Hoang Xavier Philippe","address_id":"351","workerType":"Physician"},{"id":"540","name":"Hochstrasser Denis","address_id":"351","workerType":"Physician"},{"id":"560","name":"Hoogewoud Florence","address_id":"351","workerType":"Physician"},{"id":"568","name":"Hsieh Julien Wen","address_id":"351","workerType":"Physician"},{"id":"569","name":"Hua ép. Stolz Julie","address_id":"351","workerType":"Physician"},{"id":"583","name":"Hugon ép. Rodin Justine","address_id":"351","workerType":"Physician"},{"id":"597","name":"Ibsen usage Ambroise-Ibsen Arni","address_id":"351","workerType":"Physician"},{"id":"600","name":"IGLESIAS Juan Fernando","address_id":"351","workerType":"Physician"},{"id":"602","name":"Ilario Caterina","address_id":"351","workerType":"Physician"},{"id":"611","name":"IRANMANESH Pouya","address_id":"351","workerType":"Physician"},{"id":"616","name":"Iten Lea","address_id":"351","workerType":"Physician"},{"id":"620","name":"Jaaidi Laila","address_id":"351","workerType":"Physician"},{"id":"621","name":"Jacob Maxime Valéry Charles","address_id":"351","workerType":"Physician"},{"id":"623","name":"Jacot Claude-René Guillaume","address_id":"351","workerType":"Physician"},{"id":"625","name":"Jacquelin-Ravel Nathalie Jeannine Jacqueline","address_id":"351","workerType":"Physician"},{"id":"628","name":"Jalbert Bénédicte Marie Claude","address_id":"351","workerType":"Physician"},{"id":"630","name":"Janickova Katarina","address_id":"351","workerType":"Physician"},{"id":"631","name":"Jannelli Gianpaolo","address_id":"351","workerType":"Physician"},{"id":"636","name":"Jastrow Meyer Nicole","address_id":"351","workerType":"Physician"},{"id":"637","name":"Jeandin Elisabeth Angélique Madeleine Renée","address_id":"351","workerType":"Physician"},{"id":"646","name":"Bapst Thomas Léo","address_id":"351","workerType":"Physician"},{"id":"647","name":"Jimaja Wedali Emmanuel Bamidele Antoine","address_id":"351","workerType":"Physician"},{"id":"651","name":"Johner Nicolas Jin Pierre","address_id":"351","workerType":"Physician"},{"id":"654","name":"Joliat Charles Victor Norwood","address_id":"351","workerType":"Physician"},{"id":"656","name":"Jolou Jalal","address_id":"351","workerType":"Physician"},{"id":"660","name":"Jornayvaz François Roland","address_id":"351","workerType":"Physician"},{"id":"661","name":"Joseph Jean-Marc","address_id":"351","workerType":"Physician"},{"id":"664","name":"Jotterand Valérie Sandra","address_id":"351","workerType":"Physician"},{"id":"665","name":"Jouan ép. Flahault Chrystel Fernande Renée Elyane","address_id":"351","workerType":"Physician"},{"id":"667","name":"Juillerat André Alain","address_id":"351","workerType":"Physician"},{"id":"669","name":"Jung Minoa Karin","address_id":"351","workerType":"Physician"},{"id":"678","name":"Kaczmarek Chloé Kim","address_id":"351","workerType":"Physician"},{"id":"687","name":"Kaiser Laurent Alphonse, Félix","address_id":"351","workerType":"Physician"},{"id":"689","name":"Kaiser Stefan","address_id":"351","workerType":"Physician"},{"id":"691","name":"Kakoraiti Emmanouela","address_id":"351","workerType":"Physician"},{"id":"697","name":"Kalogeropoulou Eleni","address_id":"351","workerType":"Physician"},{"id":"698","name":"Kamani Christel Hermann","address_id":"351","workerType":"Physician"},{"id":"702","name":"Kaparos Nikolaos","address_id":"351","workerType":"Physician"},{"id":"708","name":"Barde Lia Annick","address_id":"351","workerType":"Physician"},{"id":"709","name":"Karege Gatete Félix","address_id":"351","workerType":"Physician"},{"id":"710","name":"Karentzos Alexandros","address_id":"351","workerType":"Physician"},{"id":"713","name":"Karpathiou Chariton-Konstantinos","address_id":"351","workerType":"Physician"},{"id":"715","name":"Kartotaroeno Jessica Samira","address_id":"351","workerType":"Physician"},{"id":"718","name":"Kastritis Ioannis","address_id":"351","workerType":"Physician"},{"id":"724","name":"Kaufmann Fabrice","address_id":"351","workerType":"Physician"},{"id":"726","name":"Kecik Mateusz Mariusz","address_id":"351","workerType":"Physician"},{"id":"730","name":"Kehoe Samuel David","address_id":"351","workerType":"Physician"},{"id":"731","name":"Keli Barcelos ép. Perret Liaudet Gleicy","address_id":"351","workerType":"Physician"},{"id":"737","name":"Kelly Kayla Alicia","address_id":"351","workerType":"Physician"},{"id":"738","name":"Kembi Guillaume Elyes","address_id":"351","workerType":"Physician"},{"id":"740","name":"Barnaure-Nachbar Isabelle","address_id":"351","workerType":"Physician"},{"id":"741","name":"Kerbrat Romain","address_id":"351","workerType":"Physician"},{"id":"751","name":"Khodr Dany François","address_id":"351","workerType":"Physician"},{"id":"754","name":"Barras Eugénie","address_id":"351","workerType":"Physician"},{"id":"758","name":"Kiss-Bodolay Daniel","address_id":"351","workerType":"Physician"},{"id":"763","name":"Klauser Paul Frédéric","address_id":"351","workerType":"Physician"},{"id":"765","name":"Kleimberg Margaux","address_id":"351","workerType":"Physician"},{"id":"771","name":"Klepper Maureen Claudia","address_id":"351","workerType":"Physician"},{"id":"793","name":"Koegler-Tarpinian Flora Anaïd","address_id":"351","workerType":"Physician"},{"id":"802","name":"Bartolone Placido","address_id":"351","workerType":"Physician"},{"id":"812","name":"Kopp Benoît Quentin","address_id":"351","workerType":"Physician"},{"id":"816","name":"Kössler Thibaud Pierre Marie","address_id":"351","workerType":"Physician"},{"id":"820","name":"Kountouri Melpomeni","address_id":"351","workerType":"Physician"},{"id":"847","name":"Küffer Julie","address_id":"351","workerType":"Physician"},{"id":"851","name":"Batruch Matteï Hugo","address_id":"351","workerType":"Physician"},{"id":"852","name":"Kull Corey Alexander","address_id":"351","workerType":"Physician"},{"id":"857","name":"Kumps Camille","address_id":"351","workerType":"Physician"},{"id":"865","name":"Baud Maxime Olivier","address_id":"351","workerType":"Physician"},{"id":"869","name":"Kuster Matthias Axel","address_id":"351","workerType":"Physician"},{"id":"875","name":"Baud Olivier François Georges","address_id":"351","workerType":"Physician"},{"id":"877","name":"Lacour Oriane","address_id":"351","workerType":"Physician"},{"id":"878","name":"Baudino Antoine Romain","address_id":"351","workerType":"Physician"},{"id":"879","name":"Baudoin Julien Roger Pierre","address_id":"351","workerType":"Physician"},{"id":"886","name":"Lamanna Giorgio","address_id":"351","workerType":"Physician"},{"id":"887","name":"Lamartine Sabido Monteiro Marta","address_id":"351","workerType":"Physician"},{"id":"889","name":"Lambert Nelle France","address_id":"351","workerType":"Physician"},{"id":"894","name":"Lamy Mona Simone","address_id":"351","workerType":"Physician"},{"id":"900","name":"Lange Sören","address_id":"351","workerType":"Physician"},{"id":"901","name":"Lanier Cédric Maxime","address_id":"351","workerType":"Physician"},{"id":"905","name":"Laroue Thomas Eugène","address_id":"351","workerType":"Physician"},{"id":"906","name":"Larpin Christophe Nicolas","address_id":"351","workerType":"Physician"},{"id":"907","name":"Laspa Evgenia","address_id":"351","workerType":"Physician"},{"id":"915","name":"Lauffer Cédric David","address_id":"351","workerType":"Physician"},{"id":"918","name":"Lauria Francesca","address_id":"351","workerType":"Physician"},{"id":"919","name":"Lavalley Adrien Alain","address_id":"351","workerType":"Physician"},{"id":"921","name":"Lazarczyk Maciej Jakub","address_id":"351","workerType":"Physician"},{"id":"923","name":"Lazzarotto Benjamin Didier","address_id":"351","workerType":"Physician"},{"id":"926","name":"Le Gouëff Anouk Isabelle Oriane","address_id":"351","workerType":"Physician"},{"id":"927","name":"Le Peillet Damien Joseph Marius","address_id":"351","workerType":"Physician"},{"id":"929","name":"Lécluse-Barth Julien Mathias Charles Pierre","address_id":"351","workerType":"Physician"},{"id":"930","name":"Ledermann Audrey Maeva","address_id":"351","workerType":"Physician"},{"id":"932","name":"Legrand Emilie","address_id":"351","workerType":"Physician"},{"id":"942","name":"Leidi Antonio Siro Gabriele Benedetto","address_id":"351","workerType":"Physician"},{"id":"947","name":"Lenggenhager Lauriane Maeva","address_id":"351","workerType":"Physician"},{"id":"948","name":"Lenoir Vincent Micaël","address_id":"351","workerType":"Physician"},{"id":"951","name":"Lepot Ariane Sogand Monique Homa","address_id":"351","workerType":"Physician"},{"id":"953","name":"Leszek Alexandre","address_id":"351","workerType":"Physician"},{"id":"956","name":"Leuba Fink Florence Catherine","address_id":"351","workerType":"Physician"},{"id":"962","name":"Baumann Pia Patricia","address_id":"351","workerType":"Physician"},{"id":"967","name":"Lidsky Deborah Claire Esther","address_id":"351","workerType":"Physician"},{"id":"970","name":"Liernur Thibaut Dominique","address_id":"351","workerType":"Physician"},{"id":"973","name":"Ligoutsikou Konstantina","address_id":"351","workerType":"Physician"},{"id":"974","name":"Lima Faria Luis","address_id":"351","workerType":"Physician"},{"id":"975","name":"Limonta Alessandro Luigi","address_id":"351","workerType":"Physician"},{"id":"981","name":"Liot Emilie Marie Madeleine","address_id":"351","workerType":"Physician"},{"id":"985","name":"Lironi Céline","address_id":"351","workerType":"Physician"},{"id":"987","name":"Baumberger Marine","address_id":"351","workerType":"Physician"},{"id":"994","name":"Lombardi Fäh Valeria","address_id":"351","workerType":"Physician"},{"id":"995","name":"Longval Thomas Sensen","address_id":"351","workerType":"Physician"},{"id":"1000","name":"Lorillard Solenn Christine Louise","address_id":"351","workerType":"Physician"},{"id":"1004","name":"Loubet épouse Privat Nadège Amédée Jeannine","address_id":"351","workerType":"Physician"},{"id":"1005","name":"Louge Pierre Georges","address_id":"351","workerType":"Physician"},{"id":"1007","name":"Lozano Calvo Jose Jeronimo","address_id":"351","workerType":"Physician"},{"id":"1009","name":"Baumgartner Mélanie","address_id":"351","workerType":"Physician"},{"id":"1011","name":"Lucas Bénédicte Elisabeth Simone","address_id":"351","workerType":"Physician"},{"id":"1030","name":"Mach Thierry Alexandre","address_id":"351","workerType":"Physician"},{"id":"1031","name":"Mach Celia Amélie","address_id":"351","workerType":"Physician"},{"id":"1036","name":"Magnin ép. Verschelde Sophie Andrée Renée","address_id":"351","workerType":"Physician"},{"id":"1043","name":"Maillard Julien Gabriel Philippe","address_id":"351","workerType":"Physician"},{"id":"1045","name":"Maiorano Alessandra","address_id":"351","workerType":"Physician"},{"id":"1052","name":"Malézieux ép. Picard Astrid Marie","address_id":"351","workerType":"Physician"},{"id":"1053","name":"Bauwens Marine Christine","address_id":"351","workerType":"Physician"},{"id":"1059","name":"Mansi Vincent Michel","address_id":"351","workerType":"Physician"},{"id":"1063","name":"Mappoura Maria","address_id":"351","workerType":"Physician"},{"id":"1064","name":"Maragkoudakis Christos","address_id":"351","workerType":"Physician"},{"id":"1066","name":"Marchal Ophélie Marie","address_id":"351","workerType":"Physician"},{"id":"1068","name":"Marescassier Hélène Ariane","address_id":"351","workerType":"Physician"},{"id":"1070","name":"Markham Genequand Lydia","address_id":"351","workerType":"Physician"},{"id":"1077","name":"Beauverd Yan","address_id":"351","workerType":"Physician"},{"id":"1082","name":"Martin-Salvaj Gallice","address_id":"351","workerType":"Physician"},{"id":"1083","name":"Marull Paretas Emma","address_id":"351","workerType":"Physician"},{"id":"1089","name":"Massalou Damien Léon Gabriel","address_id":"351","workerType":"Physician"},{"id":"1091","name":"Masson Raphaël","address_id":"351","workerType":"Physician"},{"id":"1092","name":"Massuyeau Axelle Hélène Marie","address_id":"351","workerType":"Physician"},{"id":"1095","name":"Matos Charlotte Elisabeth","address_id":"351","workerType":"Physician"},{"id":"1096","name":"Matta Georges","address_id":"351","workerType":"Physician"},{"id":"1099","name":"Matthes Thomas Wilhelm","address_id":"351","workerType":"Physician"},{"id":"1115","name":"Maziarski Philippe Raphaël","address_id":"351","workerType":"Physician"},{"id":"1117","name":"Mazzola Olivia Mélanie","address_id":"351","workerType":"Physician"},{"id":"1119","name":"McLaren Sophie Louise","address_id":"351","workerType":"Physician"},{"id":"1121","name":"Meert Vincent Walter Etienne Ghislain","address_id":"351","workerType":"Physician"},{"id":"1122","name":"Meeùs Léopold Béatrice","address_id":"351","workerType":"Physician"},{"id":"1125","name":"Becker Laura","address_id":"351","workerType":"Physician"},{"id":"1138","name":"Mendes Aguiar Santos Aline","address_id":"351","workerType":"Physician"},{"id":"1148","name":"Meskaldji Mahacine","address_id":"351","workerType":"Physician"},{"id":"1152","name":"Meuli Joachim Nicolas Edouard","address_id":"351","workerType":"Physician"},{"id":"1153","name":"Meuli Vania Stéphanie","address_id":"351","workerType":"Physician"},{"id":"1161","name":"Meylan Nadège","address_id":"351","workerType":"Physician"},{"id":"1164","name":"MICHEL Yann Frédéric","address_id":"351","workerType":"Physician"},{"id":"1166","name":"Michels Chloé Caroline Julia","address_id":"351","workerType":"Physician"},{"id":"1168","name":"Miéville Christian","address_id":"351","workerType":"Physician"},{"id":"1170","name":"Millee Jean-Charles","address_id":"351","workerType":"Physician"},{"id":"1174","name":"Mirlesse Nicolas Benoît Akim","address_id":"351","workerType":"Physician"},{"id":"1176","name":"Mirzoyan Boris","address_id":"351","workerType":"Physician"},{"id":"1179","name":"Mitrovic Stéphane Sinisha","address_id":"351","workerType":"Physician"},{"id":"1184","name":"Moens Kevin","address_id":"351","workerType":"Physician"},{"id":"1185","name":"Moeri Michaël Jean-Jacques","address_id":"351","workerType":"Physician"},{"id":"1193","name":"Monney Marine","address_id":"351","workerType":"Physician"},{"id":"1194","name":"Monsellato Ermelinda","address_id":"351","workerType":"Physician"},{"id":"1195","name":"Montavon Gisèle Salomé","address_id":"351","workerType":"Physician"},{"id":"1202","name":"Morel Philippe","address_id":"351","workerType":"Physician"},{"id":"1206","name":"Morin ép. Zorman Sarah Florence Isabelle","address_id":"351","workerType":"Physician"},{"id":"1207","name":"Morisot Quentin Marie Olivier Alexis","address_id":"351","workerType":"Physician"},{"id":"1208","name":"Morlan Thibaud Sébastien Pierre","address_id":"351","workerType":"Physician"},{"id":"1209","name":"Bellaminutti Serena","address_id":"351","workerType":"Physician"},{"id":"1212","name":"Moser Frédy","address_id":"351","workerType":"Physician"},{"id":"1242","name":"Benacka Marek","address_id":"351","workerType":"Physician"},{"id":"1252","name":"Murek Michael Konrad","address_id":"351","workerType":"Physician"},{"id":"1258","name":"Mützenberg Fabiana","address_id":"351","workerType":"Physician"},{"id":"1259","name":"Nabergoj Mitja","address_id":"351","workerType":"Physician"},{"id":"1269","name":"Naiken Surennaidoo Perumal","address_id":"351","workerType":"Physician"},{"id":"1270","name":"Naïmi Roxane Sophie","address_id":"351","workerType":"Physician"},{"id":"1273","name":"Nasce' Alberto","address_id":"351","workerType":"Physician"},{"id":"1276","name":"Nawabi Sultan Sébastien","address_id":"351","workerType":"Physician"},{"id":"1279","name":"Nedelcu Anamaria","address_id":"351","workerType":"Physician"},{"id":"1282","name":"Neftel Cyril Ralf Alexander","address_id":"351","workerType":"Physician"},{"id":"1285","name":"Nencha Umberto","address_id":"351","workerType":"Physician"},{"id":"1288","name":"Benidjer Dahouia","address_id":"351","workerType":"Physician"},{"id":"1289","name":"Benissa Mohamed Rida","address_id":"351","workerType":"Physician"},{"id":"1290","name":"Benkabouche Mohamed","address_id":"351","workerType":"Physician"},{"id":"1293","name":"Nguyen Kim Hoang-Nam","address_id":"351","workerType":"Physician"},{"id":"1304","name":"Benoit Cédric Pascal","address_id":"351","workerType":"Physician"},{"id":"1306","name":"Nikolaou Charalampia","address_id":"351","workerType":"Physician"},{"id":"1309","name":"Noetzlin Sarah Audrey","address_id":"351","workerType":"Physician"},{"id":"1310","name":"Nogueira Loures Vania de Fatima","address_id":"351","workerType":"Physician"},{"id":"1316","name":"Norambuena Julieta Pelagia","address_id":"351","workerType":"Physician"},{"id":"1337","name":"Benzaquen David Haim","address_id":"351","workerType":"Physician"},{"id":"1338","name":"Oderbolz Kevin Jonathan Alexandre","address_id":"351","workerType":"Physician"},{"id":"1340","name":"Oestreicher Charlotte Camille Marie","address_id":"351","workerType":"Physician"},{"id":"1345","name":"Oldani Graziano","address_id":"351","workerType":"Physician"},{"id":"1346","name":"Olela Otis Michel Germain","address_id":"351","workerType":"Physician"},{"id":"1348","name":"Olivier Damien André Bertrand","address_id":"351","workerType":"Physician"},{"id":"1361","name":"Ourahmoune Aïmad Eddine","address_id":"351","workerType":"Physician"},{"id":"1362","name":"Ouvrans Julien","address_id":"351","workerType":"Physician"},{"id":"1367","name":"Bereau Matthieu","address_id":"351","workerType":"Physician"},{"id":"1368","name":"Paccaud Joris Adrien Samuel","address_id":"351","workerType":"Physician"},{"id":"1377","name":"Panchard Marc-Alain","address_id":"351","workerType":"Physician"},{"id":"1382","name":"Pant Samaksha Nath","address_id":"351","workerType":"Physician"},{"id":"1384","name":"Papadimitriou Valentina Camille","address_id":"351","workerType":"Physician"},{"id":"1387","name":"Papanastasiou Athanasios","address_id":"351","workerType":"Physician"},{"id":"1391","name":"Parrat David, Laurent","address_id":"351","workerType":"Physician"},{"id":"1397","name":"Pastene Bruno Daniel Gustave","address_id":"351","workerType":"Physician"},{"id":"1400","name":"Patiny Florentine Jocelyne","address_id":"351","workerType":"Physician"},{"id":"1402","name":"Paulet Junca Georgina","address_id":"351","workerType":"Physician"},{"id":"1410","name":"Pedrazzi Nadine Elisabeth","address_id":"351","workerType":"Physician"},{"id":"1414","name":"Peixoto Oliveira Nelson Augusto","address_id":"351","workerType":"Physician"},{"id":"1416","name":"Pelieu ép. Lamps Iris Agnès Reine","address_id":"351","workerType":"Physician"},{"id":"1419","name":"Pellegrini Elsa","address_id":"351","workerType":"Physician"},{"id":"1420","name":"Pellegrino Martina","address_id":"351","workerType":"Physician"},{"id":"1421","name":"Peloso Andrea","address_id":"351","workerType":"Physician"},{"id":"1422","name":"Pelouze Alexandre Jean","address_id":"351","workerType":"Physician"},{"id":"1423","name":"Pereira Camejo Maricé","address_id":"351","workerType":"Physician"},{"id":"1428","name":"Perret Laurelie","address_id":"351","workerType":"Physician"},{"id":"1433","name":"Perrin Tilman Nicolas Ulrich","address_id":"351","workerType":"Physician"},{"id":"1434","name":"Perrin Julia Axelle","address_id":"351","workerType":"Physician"},{"id":"1446","name":"Petrou Ilias","address_id":"351","workerType":"Physician"},{"id":"1456","name":"Bergougnoux Brice Baptiste","address_id":"351","workerType":"Physician"},{"id":"1458","name":"Picardi Cristina","address_id":"351","workerType":"Physician"},{"id":"1461","name":"Pilichou Eleni","address_id":"351","workerType":"Physician"},{"id":"1466","name":"Podetta Michele","address_id":"351","workerType":"Physician"},{"id":"1467","name":"Poggi Roberto","address_id":"351","workerType":"Physician"},{"id":"1469","name":"Poli Lauriane","address_id":"351","workerType":"Physician"},{"id":"1471","name":"Polito Andrea","address_id":"351","workerType":"Physician"},{"id":"1473","name":"Pollorsi Gaia","address_id":"351","workerType":"Physician"},{"id":"1474","name":"Ponet Loïc Pierre","address_id":"351","workerType":"Physician"},{"id":"1476","name":"Popal Festa Bahar","address_id":"351","workerType":"Physician"},{"id":"1480","name":"Popp Julius Daniel","address_id":"351","workerType":"Physician"},{"id":"1489","name":"Praplan Guillaume Benoit","address_id":"351","workerType":"Physician"},{"id":"1493","name":"Priamo Julien","address_id":"351","workerType":"Physician"},{"id":"1499","name":"Prod'hom Sophie Victoria","address_id":"351","workerType":"Physician"},{"id":"1500","name":"Bernava Gianmarco","address_id":"351","workerType":"Physician"},{"id":"1502","name":"Pugliesi Angela","address_id":"351","workerType":"Physician"},{"id":"1506","name":"Quagliarini Beatrice","address_id":"351","workerType":"Physician"},{"id":"1517","name":"Berney Sylvain Gibus","address_id":"351","workerType":"Physician"},{"id":"1518","name":"Raffoul Toni","address_id":"351","workerType":"Physician"},{"id":"1519","name":"Rahban Charbel","address_id":"351","workerType":"Physician"},{"id":"1531","name":"Ranza Emmanuelle Nathalie","address_id":"351","workerType":"Physician"},{"id":"1532","name":"Bernier Jacques R.F.","address_id":"351","workerType":"Physician"},{"id":"1537","name":"Berquier Guillaume Louis Emile","address_id":"351","workerType":"Physician"},{"id":"1554","name":"Reinmann Marie Aurélie","address_id":"351","workerType":"Physician"},{"id":"1563","name":"Rémy Tristan Louis","address_id":"351","workerType":"Physician"},{"id":"1570","name":"Requejo Rodriguez Elena","address_id":"351","workerType":"Physician"},{"id":"1576","name":"Berthet Tillandsia Adeline Maxence","address_id":"351","workerType":"Physician"},{"id":"1580","name":"Reymond Mattéo Balthazar","address_id":"351","workerType":"Physician"},{"id":"1581","name":"Reymond Philippe Germain","address_id":"351","workerType":"Physician"},{"id":"1582","name":"Reynaud Marine Cyrielle","address_id":"351","workerType":"Physician"},{"id":"1596","name":"Rigumye Lloyd Orphee","address_id":"351","workerType":"Physician"},{"id":"1597","name":"Rilliet Bénédict","address_id":"351","workerType":"Physician"},{"id":"1601","name":"Rinaldi Lara Dafne","address_id":"351","workerType":"Physician"},{"id":"1617","name":"Bertrand Jérome Léo Karim","address_id":"351","workerType":"Physician"},{"id":"1620","name":"Rochat Tamara Séverine","address_id":"351","workerType":"Physician"},{"id":"1622","name":"Rodrigues Gaspar","address_id":"351","workerType":"Physician"},{"id":"1623","name":"Rodriguez Fernandez Maria Julia","address_id":"351","workerType":"Physician"},{"id":"1626","name":"Roggenhofer Elisabeth","address_id":"351","workerType":"Physician"},{"id":"1629","name":"Rohr Marie Madeleine","address_id":"351","workerType":"Physician"},{"id":"1635","name":"Roosendaal Astrid Marijke","address_id":"351","workerType":"Physician"},{"id":"1642","name":"Bessis Anne-Sophie Marie","address_id":"351","workerType":"Physician"},{"id":"1643","name":"Rossitto Mauro","address_id":"351","workerType":"Physician"},{"id":"1653","name":"Roua Elodie Marie","address_id":"351","workerType":"Physician"},{"id":"1655","name":"Rouyer Frederic Jean Roger","address_id":"351","workerType":"Physician"},{"id":"1657","name":"Royston Léna Elisabeth Eva","address_id":"351","workerType":"Physician"},{"id":"1658","name":"Rubbia Brandt Laura","address_id":"351","workerType":"Physician"},{"id":"1660","name":"Rudermann Raquel","address_id":"351","workerType":"Physician"},{"id":"1664","name":"Ruffieux Etienne Romain","address_id":"351","workerType":"Physician"},{"id":"1677","name":"Sabe Michel","address_id":"351","workerType":"Physician"},{"id":"1678","name":"Sabouret Laurence Marie","address_id":"351","workerType":"Physician"},{"id":"1690","name":"Salamoni Myriam","address_id":"351","workerType":"Physician"},{"id":"1693","name":"Salmon Basile Lothaire","address_id":"351","workerType":"Physician"},{"id":"1696","name":"Samara Eleftheria","address_id":"351","workerType":"Physician"},{"id":"1699","name":"Samii Kaveh","address_id":"351","workerType":"Physician"},{"id":"1701","name":"Beyer Katharina","address_id":"351","workerType":"Physician"},{"id":"1702","name":"Sanida Evangelia","address_id":"351","workerType":"Physician"},{"id":"1703","name":"Sanson Nicole","address_id":"351","workerType":"Physician"},{"id":"1704","name":"Sanson Morgane Elise Arielle","address_id":"351","workerType":"Physician"},{"id":"1708","name":"Santos Oliveira Patrique","address_id":"351","workerType":"Physician"},{"id":"1710","name":"Saranti Eva","address_id":"351","workerType":"Physician"},{"id":"1712","name":"Sartorius Danielle, Marie","address_id":"351","workerType":"Physician"},{"id":"1718","name":"Scarpa Cosimo Riccardo","address_id":"351","workerType":"Physician"},{"id":"1728","name":"Schaller Diane Marie Mireille","address_id":"351","workerType":"Physician"},{"id":"1729","name":"Schaller Mathilde","address_id":"351","workerType":"Physician"},{"id":"1742","name":"Bianchi Davide","address_id":"351","workerType":"Physician"},{"id":"1760","name":"Schläpfer Pierre","address_id":"351","workerType":"Physician"},{"id":"1804","name":"Schneider Marie","address_id":"351","workerType":"Physician"},{"id":"1805","name":"Agapitou Eleni","address_id":"351","workerType":"Physician"},{"id":"1806","name":"Schnetz Marc André","address_id":"351","workerType":"Physician"},{"id":"1811","name":"Schoeni Sophie Marie","address_id":"351","workerType":"Physician"},{"id":"1822","name":"Schrumpf David Christian","address_id":"351","workerType":"Physician"},{"id":"1825","name":"Schuhler-Farny Caroline Anne-Marie Monique","address_id":"351","workerType":"Physician"},{"id":"1831","name":"Schumacher Fanny Cassandra","address_id":"351","workerType":"Physician"},{"id":"1832","name":"Bigoni Jérôme Pierre","address_id":"351","workerType":"Physician"},{"id":"1835","name":"Bikye Thérèse Diane","address_id":"351","workerType":"Physician"},{"id":"1845","name":"Schwery Marie","address_id":"351","workerType":"Physician"},{"id":"1849","name":"Sciotto Francesco","address_id":"351","workerType":"Physician"},{"id":"1861","name":"Seipel Amanda Helene Michaelsdotter","address_id":"351","workerType":"Physician"},{"id":"1863","name":"Sekarski-Hunkeler Nicole","address_id":"351","workerType":"Physician"},{"id":"1867","name":"Senchyna Arun François Orson","address_id":"351","workerType":"Physician"},{"id":"1870","name":"Serfaty Emmanuel","address_id":"351","workerType":"Physician"},{"id":"1871","name":"Serir Maryam","address_id":"351","workerType":"Physician"},{"id":"1885","name":"Silva Baticam Nalla","address_id":"351","workerType":"Physician"},{"id":"1896","name":"Singovski Simon","address_id":"351","workerType":"Physician"},{"id":"1905","name":"Sommaruga Samuel Aramis Cornélio","address_id":"351","workerType":"Physician"},{"id":"1908","name":"Soret Guillaume Nicolas Serge","address_id":"351","workerType":"Physician"},{"id":"1909","name":"Soroken Cindy Jan","address_id":"351","workerType":"Physician"},{"id":"1911","name":"Sossauer Laura Marion","address_id":"351","workerType":"Physician"},{"id":"1912","name":"Soudry Sophie Myriam","address_id":"351","workerType":"Physician"},{"id":"1913","name":"Souvatzi Elissavet","address_id":"351","workerType":"Physician"},{"id":"1914","name":"Sowinska Magdalena Maria","address_id":"351","workerType":"Physician"},{"id":"1922","name":"Springer Christina","address_id":"351","workerType":"Physician"},{"id":"1925","name":"Stafuzza Caterina","address_id":"351","workerType":"Physician"},{"id":"1932","name":"Stancu Patrick Jon George","address_id":"351","workerType":"Physician"},{"id":"1939","name":"Stefani Alexandra Laura","address_id":"351","workerType":"Physician"},{"id":"1960","name":"Biver Emmanuel Joseph Gilbert","address_id":"351","workerType":"Physician"},{"id":"1965","name":"Stollar Fabiola","address_id":"351","workerType":"Physician"},{"id":"1968","name":"Stolz Hadrien Hubert Nicolas","address_id":"351","workerType":"Physician"},{"id":"1970","name":"Stormacq Sophie Aline","address_id":"351","workerType":"Physician"},{"id":"1975","name":"Strebel Matthew James","address_id":"351","workerType":"Physician"},{"id":"1982","name":"Blaiberg Samantha Tatiana","address_id":"351","workerType":"Physician"},{"id":"1986","name":"Stuckelberger Yann Luca","address_id":"351","workerType":"Physician"},{"id":"1991","name":"Stuker Nathalie Céline","address_id":"351","workerType":"Physician"},{"id":"2007","name":"Sztajzel Roman Félix","address_id":"351","workerType":"Physician"},{"id":"2008","name":"Tabibian David","address_id":"351","workerType":"Physician"},{"id":"2010","name":"Tabouret Claire Valérie","address_id":"351","workerType":"Physician"},{"id":"2015","name":"Tapparel Ludovic Mathieu","address_id":"351","workerType":"Physician"},{"id":"2018","name":"Blaser Stéphanie Christine","address_id":"351","workerType":"Physician"},{"id":"2023","name":"Taylor Walter Robert John","address_id":"351","workerType":"Physician"},{"id":"2024","name":"Tchepanvo Touohou Guyrette Marius","address_id":"351","workerType":"Physician"},{"id":"2028","name":"Tercier Stéphane Georges","address_id":"351","workerType":"Physician"},{"id":"2029","name":"Teres Castillo Cheryl","address_id":"351","workerType":"Physician"},{"id":"2032","name":"Tessiatore Patrizia","address_id":"351","workerType":"Physician"},{"id":"2033","name":"Testaz Magali Claire","address_id":"351","workerType":"Physician"},{"id":"2042","name":"Thévoz Laurence Delphine","address_id":"351","workerType":"Physician"},{"id":"2046","name":"Thomet Céline","address_id":"351","workerType":"Physician"},{"id":"2059","name":"Tilliette Marie-Ange Georges","address_id":"351","workerType":"Physician"},{"id":"2061","name":"Tirefort Yordanka","address_id":"351","workerType":"Physician"},{"id":"2062","name":"Tissandier Côme","address_id":"351","workerType":"Physician"},{"id":"2064","name":"Tizi Karima","address_id":"351","workerType":"Physician"},{"id":"2067","name":"Todoran Dana","address_id":"351","workerType":"Physician"},{"id":"2068","name":"Todorovic Tania","address_id":"351","workerType":"Physician"},{"id":"2074","name":"Toso Seema","address_id":"351","workerType":"Physician"},{"id":"2089","name":"Trigui Nader","address_id":"351","workerType":"Physician"},{"id":"2090","name":"Triolo Julie Coralie","address_id":"351","workerType":"Physician"},{"id":"2101","name":"Tsouni Pinelopi","address_id":"351","workerType":"Physician"},{"id":"2105","name":"Tulvan Georgiana","address_id":"351","workerType":"Physician"},{"id":"2114","name":"Uginet Marjolaine Flore Catherine","address_id":"351","workerType":"Physician"},{"id":"2124","name":"Urner Esther Aïsha","address_id":"351","workerType":"Physician"},{"id":"2132","name":"Valpaços Magalhaes Ana Catarina","address_id":"351","workerType":"Physician"},{"id":"2133","name":"van der Bent Pauline Léa","address_id":"351","workerType":"Physician"},{"id":"2135","name":"Ahrendts Ulrike Annette","address_id":"351","workerType":"Physician"},{"id":"2137","name":"Vanden Eynden Xavier Pierre","address_id":"351","workerType":"Physician"},{"id":"2139","name":"Vannespenne Damien Cyrille Julien","address_id":"351","workerType":"Physician"},{"id":"2141","name":"Varvagiannis Konstantinos","address_id":"351","workerType":"Physician"},{"id":"2142","name":"Vasilakou Evgenia","address_id":"351","workerType":"Physician"},{"id":"2144","name":"Böcher Lena Katharina","address_id":"351","workerType":"Physician"},{"id":"2145","name":"Vaz Madera Rachel Isabelle","address_id":"351","workerType":"Physician"},{"id":"2146","name":"Vecera Domenico","address_id":"351","workerType":"Physician"},{"id":"2147","name":"Vecsernyés Noémie Boglarka","address_id":"351","workerType":"Physician"},{"id":"2156","name":"Vermeille Matthieu Louis Ernest Pierre","address_id":"351","workerType":"Physician"},{"id":"2162","name":"Bocksberger Jean-Philippe","address_id":"351","workerType":"Physician"},{"id":"2165","name":"Villa Fabio","address_id":"351","workerType":"Physician"},{"id":"2167","name":"Villeneuve Delphine Marie Suzanne Francine","address_id":"351","workerType":"Physician"},{"id":"2175","name":"Vochtchinina Nadejda","address_id":"351","workerType":"Physician"},{"id":"2185","name":"Voirol Ulysse Hubert Jean","address_id":"351","workerType":"Physician"},{"id":"2190","name":"von Düring Stephan Detlef Robert","address_id":"351","workerType":"Physician"},{"id":"2194","name":"von Rohr Cécilia Marie Eugénie","address_id":"351","workerType":"Physician"},{"id":"2195","name":"von Schnakenburg Leona Fee Valentine","address_id":"351","workerType":"Physician"},{"id":"2200","name":"Voreopoulou Thaleia","address_id":"351","workerType":"Physician"},{"id":"2206","name":"Wacker Bou Puigdefabregas Julie Caroline","address_id":"351","workerType":"Physician"},{"id":"2209","name":"Waeber Baptiste","address_id":"351","workerType":"Physician"},{"id":"2227","name":"Walter Caroline","address_id":"351","workerType":"Physician"},{"id":"2230","name":"Wanders Aurélie Jacqueline Barbara","address_id":"351","workerType":"Physician"},{"id":"2231","name":"Wanyanga Pierre Mwito","address_id":"351","workerType":"Physician"},{"id":"2238","name":"Wegelius Helena Patricia","address_id":"351","workerType":"Physician"},{"id":"2244","name":"Weinberger Andreas Willi Adolf","address_id":"351","workerType":"Physician"},{"id":"2262","name":"Akaâboune Mohammed","address_id":"351","workerType":"Physician"},{"id":"2265","name":"Bolli Lucie","address_id":"351","workerType":"Physician"},{"id":"2284","name":"Windisch Olivier Laurent","address_id":"351","workerType":"Physician"},{"id":"2291","name":"Wiseman Ashley Xavérine","address_id":"351","workerType":"Physician"},{"id":"2306","name":"Wozniak Hannah Gail Meredith","address_id":"351","workerType":"Physician"},{"id":"2307","name":"Wuarin Raphaël Laurent","address_id":"351","workerType":"Physician"},{"id":"2308","name":"Wuillemin Timothée","address_id":"351","workerType":"Physician"},{"id":"2319","name":"Xheladini Imrane","address_id":"351","workerType":"Physician"},{"id":"2321","name":"Yan David Jun","address_id":"351","workerType":"Physician"},{"id":"2327","name":"Yue Tilman Christoph","address_id":"351","workerType":"Physician"},{"id":"2331","name":"Akkawi Mohamed Fayez","address_id":"351","workerType":"Physician"},{"id":"2362","name":"Zucchello Stephanie Zoe Augusta","address_id":"351","workerType":"Physician"},{"id":"2367","name":"Zumkehr Julien Frédy","address_id":"351","workerType":"Physician"},{"id":"2379","name":"Bordry Natacha Anne-Sophie","address_id":"351","workerType":"Physician"},{"id":"2381","name":"Borgeaud Simon Gaspard","address_id":"351","workerType":"Physician"},{"id":"2385","name":"Al Hadi Pierre Adam","address_id":"351","workerType":"Physician"},{"id":"2395","name":"Alalwan Heba Aladin Abdulsahib","address_id":"351","workerType":"Physician"},{"id":"2401","name":"Boucher Astrid Linda","address_id":"351","workerType":"Physician"},{"id":"2402","name":"Bouchez Laurie Denise Jeanne","address_id":"351","workerType":"Physician"},{"id":"2403","name":"Boudabbous Sana","address_id":"351","workerType":"Physician"},{"id":"2404","name":"Boughanem Nihed","address_id":"351","workerType":"Physician"},{"id":"2405","name":"Boukakiou Reda Hossein","address_id":"351","workerType":"Physician"},{"id":"2406","name":"Bounaix Laura Hélène","address_id":"351","workerType":"Physician"},{"id":"2407","name":"Bourezg Ali","address_id":"351","workerType":"Physician"},{"id":"2408","name":"Bourquin Carole","address_id":"351","workerType":"Physician"},{"id":"2409","name":"Bouzelmat Fairouz","address_id":"351","workerType":"Physician"},{"id":"2422","name":"Braye Eilena Vanessa Roselyne","address_id":"351","workerType":"Physician"},{"id":"2423","name":"Alberto Chloé Julie","address_id":"351","workerType":"Physician"},{"id":"2424","name":"Bréchet Bachmann Anne-Claire Erica","address_id":"351","workerType":"Physician"},{"id":"2428","name":"Breitenstein Alexandra Marie","address_id":"351","workerType":"Physician"},{"id":"2438","name":"Brönnimann Enrico","address_id":"351","workerType":"Physician"},{"id":"2439","name":"Brossard Philippe Claude","address_id":"351","workerType":"Physician"},{"id":"2450","name":"Alcouce Eduardo","address_id":"351","workerType":"Physician"},{"id":"2451","name":"Brunner Alexandrine Marie Eléa","address_id":"351","workerType":"Physician"},{"id":"2453","name":"Alec Milena Sophia","address_id":"351","workerType":"Physician"},{"id":"2457","name":"Buchs Elisa Myriam","address_id":"351","workerType":"Physician"},{"id":"2461","name":"Buffle Camille Leyla Aude","address_id":"351","workerType":"Physician"},{"id":"2471","name":"Burgan Hania Carina","address_id":"351","workerType":"Physician"},{"id":"2472","name":"Burgan Ryan","address_id":"351","workerType":"Physician"},{"id":"2474","name":"Burgermeister Simon Jules Eric","address_id":"351","workerType":"Physician"},{"id":"2491","name":"Abed Fatiha","address_id":"351","workerType":"Physician"},{"id":"2493","name":"Butticci Roberta","address_id":"351","workerType":"Physician"},{"id":"2502","name":"Camail Roxane","address_id":"351","workerType":"Physician"},{"id":"2504","name":"Allievi Claire Jeanne","address_id":"351","workerType":"Physician"},{"id":"2506","name":"Campiche Sarah","address_id":"351","workerType":"Physician"},{"id":"2508","name":"Cantero Chloé Candice","address_id":"351","workerType":"Physician"},{"id":"2512","name":"Capanna Federica","address_id":"351","workerType":"Physician"},{"id":"2514","name":"Caronni Guido Marco","address_id":"351","workerType":"Physician"},{"id":"2521","name":"Alt Alexandre Pierre Eugène","address_id":"351","workerType":"Physician"},{"id":"2522","name":"Caspari Maud Alexandra","address_id":"351","workerType":"Physician"},{"id":"2524","name":"Castro Julie Anne","address_id":"351","workerType":"Physician"},{"id":"2525","name":"Castro Reina Daniel","address_id":"351","workerType":"Physician"},{"id":"2527","name":"Catho Gaud Marie Catherine","address_id":"351","workerType":"Physician"},{"id":"2532","name":"Cediel Canals Maria Lucia","address_id":"351","workerType":"Physician"},{"id":"2538","name":"Ceruti Samuele","address_id":"351","workerType":"Physician"},{"id":"2542","name":"Chacowry Komal Rachna","address_id":"351","workerType":"Physician"},{"id":"2544","name":"Chamot Nicolas Christian Marie","address_id":"351","workerType":"Physician"},{"id":"2546","name":"Chappalley Dimitri","address_id":"351","workerType":"Physician"},{"id":"2550","name":"Charalampous Nikolaos","address_id":"351","workerType":"Physician"},{"id":"2552","name":"Chatelanat Olivier","address_id":"351","workerType":"Physician"},{"id":"2555","name":"Chauvet-Gelinier Jean-Christophe Paul","address_id":"351","workerType":"Physician"},{"id":"2563","name":"Chevallier Claire Germaine Marthe Constance","address_id":"351","workerType":"Physician"},{"id":"2566","name":"Chevrier Raphaël David","address_id":"351","workerType":"Physician"},{"id":"2567","name":"Chiabotto Chiara","address_id":"351","workerType":"Physician"},{"id":"2569","name":"Chiesa Olivier Franck","address_id":"351","workerType":"Physician"},{"id":"2570","name":"Chiesa Sarah Carla Elisa","address_id":"351","workerType":"Physician"},{"id":"2571","name":"Chieze Marie","address_id":"351","workerType":"Physician"},{"id":"2592","name":"Coassolo Patrice Jérôme","address_id":"351","workerType":"Physician"},{"id":"2593","name":"Cole Pierre Louis Matthieu","address_id":"351","workerType":"Physician"},{"id":"2594","name":"Colinet Emilie Marie-Lou","address_id":"351","workerType":"Physician"},{"id":"2595","name":"Compagnon Philippe Lucien","address_id":"351","workerType":"Physician"},{"id":"2603","name":"Cools Evelien","address_id":"351","workerType":"Physician"},{"id":"2604","name":"Copercini Michele","address_id":"351","workerType":"Physician"},{"id":"2605","name":"Coppens Elia Willy Yvonne","address_id":"351","workerType":"Physician"},{"id":"2607","name":"Cordier Maria","address_id":"351","workerType":"Physician"},{"id":"2609","name":"Corigliano Teresa","address_id":"351","workerType":"Physician"},{"id":"2612","name":"Coste Christophe Christian Eudes","address_id":"351","workerType":"Physician"},{"id":"2613","name":"Coste Florence Chantal Julie","address_id":"351","workerType":"Physician"},{"id":"2615","name":"Craviari Cecilia","address_id":"351","workerType":"Physician"},{"id":"2616","name":"Cristallo Lacalamita Marirosa","address_id":"351","workerType":"Physician"},{"id":"2622","name":"Cunningham Sophie Dora","address_id":"351","workerType":"Physician"},{"id":"2623","name":"Cuvelier Clémence Marie","address_id":"351","workerType":"Physician"},{"id":"2625","name":"Da Graca Vera Cruz Mandinga Silésia Nuria","address_id":"351","workerType":"Physician"},{"id":"2627","name":"Da Silva Costa Gonçalves Rato Veronica Luisa","address_id":"351","workerType":"Physician"},{"id":"2628","name":"Da Silva Matos Ferreira Pedro Antonio","address_id":"351","workerType":"Physician"},{"id":"2633","name":"D'Andrea Francesco","address_id":"351","workerType":"Physician"},{"id":"2634","name":"d'Andréa Alexia","address_id":"351","workerType":"Physician"},{"id":"2637","name":"Dash Jonathan","address_id":"351","workerType":"Physician"},{"id":"2638","name":"Dash Jérémy","address_id":"351","workerType":"Physician"},{"id":"2644","name":"Dayal Nicolas Benjamin","address_id":"351","workerType":"Physician"},{"id":"2645","name":"Dayer Julie-Anne","address_id":"351","workerType":"Physician"},{"id":"2646","name":"Dayer Maud-Laure","address_id":"351","workerType":"Physician"},{"id":"2649","name":"De Bodman ép. Launay Charlotte Marie Brigitte","address_id":"351","workerType":"Physician"},{"id":"2650","name":"de Buys Roessingh Anthony Stephan","address_id":"351","workerType":"Physician"},{"id":"2654","name":"de Charrière Amandine Solange Marie","address_id":"351","workerType":"Physician"},{"id":"2658","name":"de Lorenzi Caroline Marie","address_id":"351","workerType":"Physician"},{"id":"2659","name":"de Massougnes des Fontaines Sophie Charlotte Elsa","address_id":"351","workerType":"Physician"},{"id":"2660","name":"De Mesmaeker Stéphanie Joëlle Sabine","address_id":"351","workerType":"Physician"},{"id":"2661","name":"De Oliveira Lourenco Joao Carlos","address_id":"351","workerType":"Physician"},{"id":"2664","name":"De Ramon Ortiz Carmen Julia","address_id":"351","workerType":"Physician"},{"id":"2666","name":"de Sousa Sandra Cristina","address_id":"351","workerType":"Physician"},{"id":"2668","name":"Deac Monica-Oana","address_id":"351","workerType":"Physician"},{"id":"2672","name":"Decrombecque Thibaut Louis François","address_id":"351","workerType":"Physician"},{"id":"2674","name":"Amstutz Sébastien Alexandre","address_id":"351","workerType":"Physician"},{"id":"2680","name":"Deligianni Marianthi Lousiana Symeonia","address_id":"351","workerType":"Physician"},{"id":"2685","name":"Delmarre Emmanuelle Seema","address_id":"351","workerType":"Physician"},{"id":"2687","name":"Anastasiou Maria","address_id":"351","workerType":"Physician"},{"id":"2690","name":"Demirtas Ezgi Dilek","address_id":"351","workerType":"Physician"},{"id":"2691","name":"Denis Antoine Fabrice","address_id":"351","workerType":"Physician"},{"id":"2693","name":"Anci Eleonora","address_id":"351","workerType":"Physician"},{"id":"2695","name":"Descloux Emilienne Eugénie Antoinette","address_id":"351","workerType":"Physician"},{"id":"2698","name":"Devillé Cédric André M","address_id":"351","workerType":"Physician"},{"id":"2700","name":"Dhouib ép. Chargui Amira","address_id":"351","workerType":"Physician"},{"id":"2712","name":"Anderson De La Llana Rebecca","address_id":"351","workerType":"Physician"},{"id":"2719","name":"Djakovic ép. Todic Tanja","address_id":"351","workerType":"Physician"}]};
    start(INCOMING_DATA);
    // $.ajax({
    //     url : "http://localhost/~pdeboer/roche_labs/index.php/labmap/labGraphInfo/" + mainLabId,
    //     method: "GET",
    //     dataType: 'json',
    //     contentType: "application/json",
    //     success: function(result){
    //         start(result);
    //     },
    //     error: function(error){
    //         console.log(error);
    //         // define behaviour
    //     }
    // });

});

// function called when clicking the grey space out of the canvas in full screen
function exitFullScreen(event){
    if (tFullScreen)
        toggleFullScreen(event);
}

function graphCanvasWhiteBackgroundClick(event){
    event.stopPropagation();
}
function nodeInfoClick(event){
    event.stopPropagation();
}

// function called when the full screen icon is clicked
function toggleFullScreen(event){
    var graphCanvasMovableContainer = document.getElementById('graphCanvasMovableContainer')
    var nodeInfo = document.getElementById('nodeInfo');
    if (tFullScreen){
        var graphCanvasContainer = document.getElementById('graphCanvasContainer');
        graphCanvasMovableContainer.style.position = "relative";
        graphCanvasMovableContainer.style.left = "";
        graphCanvasMovableContainer.style.top = "";
        graphCanvasContainer.appendChild(graphCanvasMovableContainer);

        graphCanvas.style.width = "100%";
        graphCanvas.style.height= "100%";
        graphCanvas.style.marginTop = "0px";
        graphCanvas.style.marginLeft = "0px";
        nodeInfo.style.display = "none";
        tFullScreen = false;

        // switch icons
        document.getElementById('fullScreenIcon').style.display = "";
        document.getElementById('exitFullScreenIcon').style.display = "none";
    }else{
        graphCanvasMovableContainer.style.position = "fixed";
        graphCanvasMovableContainer.style.left = "0%";
        graphCanvasMovableContainer.style.top = "0%";
        graphCanvasMovableContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
        graphCanvasMovableContainer.style.zIndex = 998;

        nodeInfo.style.marginLeft = window.innerWidth * 0.1 + "px";
        nodeInfo.style.marginTop = window.innerHeight * 0.1 + "px";
        nodeInfo.style.display = "block";

        // 150 is the nodeInfo width
        graphCanvas.style.width = (window.innerWidth * 0.8 - 180) + "px" ;
        graphCanvas.style.marginLeft = (window.innerWidth * 0.1 + 180) + "px";
        graphCanvas.style.height = "80%";
        graphCanvas.style.marginTop = (window.innerHeight * 0.1) + "px";

        document.body.appendChild(graphCanvasMovableContainer);
        tFullScreen = true;
        updateSelectedNodeInfo();

        // switch icons
        document.getElementById('exitFullScreenIcon').style.display = "";
        document.getElementById('fullScreenIcon').style.display = "none";
    }
    fitFlag = true;
    fitAnimationFlag = false;

    event.stopPropagation();
}

function getLabId(id){
    return "h_" + id;
}

function getPersonId(id){
    return "p_" + id;
}

function isNodeId(id){
    return (id[0] == "p" || id[0] == "h");
}

var edgeIdCounter = 0;

function getEdgeId(){
    edgeIdCounter++;
    return "e_" + edgeIdCounter;
}

function start(result){
    // find main lab cluster (needed for later)
    var mainLabCluster = 0;
    for (var i = 0; i < result.related_labs.length; i++){
        var lab = result.related_labs[i];
        var isMainLab = (lab.id == mainLabId);
        if (isMainLab){
            mainLabCluster = lab.cluster_id;
            break;
        }
    }

    // create nodes and edges

    // hospital nodes, from the hospital-hospital relationship
    for (var i = 0; i < result.related_labs.length; i++){
        var lab = result.related_labs[i];
        var labId = getLabId(lab.id);
        var isMainLab = (lab.id == mainLabId);
        var hospitalNode = new GraphNode(lab.id, labId, NodeTypeEnum.HOSPITAL, lab.name, isMainLab, lab.cluster_id, (lab.cluster_id == mainLabCluster));

        // fill hashmap and basic structure for vis
        nodesMap[labId] = hospitalNode;
        hospitals.push(hospitalNode);

        if (lab.id != mainLabId){
            hospitalConnections.push(new GraphEdge(getEdgeId(), getLabId(mainLabId), labId, EdgeTypeEnum.HOSPITAL_HOSPITAL, 1, -1));
        }

        for (var j = 0; j < result.workers.length; j++){
            if (result.workers[j].address_id == lab.id){
                hospitalNode.addEmployee(result.workers[j].id, result.workers[j].name, result.workers[j].workerType);
            }
        }
    }

    // people nodes, from the works at relationship
    for (var i = 0; i < result.related_people.length; i++){
        var person = result.related_people[i];
        var personId = getPersonId(person.id);

        // fill hashmap and basic structure for vis. Since we are filling people from the related people
        // relationship, there can be repeated ones, so each has to be created just once
        if (!nodesMap[personId]){
            var personNode = new GraphNode(person.id, personId, NodeTypeEnum.PERSON, person.name);
            nodesMap[personId] = personNode;
            people.push(personNode);
        }

        var labId = getLabId(person.address_id);
        personHospitalConnections.push(new GraphEdge(getEdgeId(), labId, personId, EdgeTypeEnum.HOSPITAL_PERSON, 1, -1));
    }

    // people relationships (coauthors, citations)
    for (var i = 0; i < result.relationships.length; i++){
        var rel = result.relationships[i];
        console.log(rel);
        var fromId = getPersonId(rel.from_person_id);
        var toId = getPersonId(rel.to_person_id);

        // if the other relationship exists, just modify the type and add the numbers
        var existingRel = existsPeopleRelationship(peopleConnections, toId, fromId);
        if (existingRel){
            existingRel.addConnectionType(fromId, toId, parseInt(rel.connection_type), parseFloat(rel.edge_weight))
        }else{
            peopleConnections.push(new GraphEdge(getEdgeId(), fromId, toId, EdgeTypeEnum.PERSON_PERSON, parseFloat(rel.edge_weight), parseInt(rel.connection_type)));
        }
    }

    // prepare nodes
    var mergedNodes = hospitals.concat(people);

    // prepare edges
    var mergedEdges = hospitalConnections.concat(personHospitalConnections).concat(peopleConnections);
    for (var i = 0; i < mergedEdges.length; i++){
        edgesMap[mergedEdges[i].id] = mergedEdges[i];
    }

    // add edges to nodes
    for (var edgeId in edgesMap){
        var edge = getEdge(edgeId);

        var nodeFrom = getNode(edge.from);
        var nodeTo = getNode(edge.to);

        nodeFrom.addEdge(edge);
        nodeTo.addEdge(edge);

        edge.addNode(nodeFrom);
        edge.addNode(nodeTo);
    }

    updateValidEdges();
    filterMap();
    updateValidEdges();

    for (var id in nodesMap){
        var node = nodesMap[id];
        node.updateShowableNode();
    }

    updateValidEdges();

    var datasetToAddNodes = [];
    for (var i = 0; i < mergedNodes.length; i++){
        if (mergedNodes[i].shouldBeAddedToGraph()){
            mergedNodes[i].addedToGraph = true;
            datasetToAddNodes.push(mergedNodes[i]);
        }else{
            mergedNodes[i].addedToGraph = false;
        }
    }
    datasetNodes = new vis.DataSet(datasetToAddNodes);

    var datasetToAddEdges = [];
    for (var i = 0; i < mergedEdges.length; i++){
        if (mergedEdges[i].shouldBeAddedToGraph()){
            mergedEdges[i].addedToGraph = true;
            datasetToAddEdges.push(mergedEdges[i]);
        }else{
            mergedEdges[i].addedToGraph = false;
        }
    }
    datasetEdges = new vis.DataSet(datasetToAddEdges);

    var data = { nodes : datasetNodes, edges : datasetEdges };

    var options = {
        configure : { enabled : false },
        physics : physicsOptions,
        nodes : { /*fixed : {x : false, y : false}*/ },
        interaction : { dragNodes : false, hover : true },
        layout : { improvedLayout : false },
        edges : { hoverWidth : 0.2, smooth : { forceDirection : "none", roundness : 0.85 }}
    };

    graphCanvas = document.getElementById('graphCanvasWhiteBackground');
    var canvasContainer = document.getElementById('graphCanvas');
    labgraph = new vis.Network(canvasContainer, data, options);
    updateNodesPositions();

    // map events
    labgraph.on('click', clickOnCanvas);
    labgraph.on('hoverNode', hoverNode);
    labgraph.on('blurNode', blurNode);
    labgraph.on('hoverEdge', hoverEdge);
    labgraph.on('blurEdge', blurEdge);
    labgraph.on('afterDrawing', afterDraw);
    labgraph.on('zoom', afterZoom);

    updateMap();
    fitCamera(false);

    setTimeout(function(){
        fitCamera(true);
    }, 2000);

    graphState = GraphStateEnum.STEADY;

    // if there are no hospitalsrelated to the main one
    if (hospitals.length == 1){
        nodesMap[getLabId(mainLabId)].selectNode();
    }

    requestAnimationFrame(mainLoop);
}

function existsPeopleRelationship(rels, fromId, toId){
    var existingRel = null;
    for (var i = 0; i < rels.length; i++){
        if (rels[i].from == fromId && rels[i].to == toId){
            existingRel = rels[i];
            break;
        }
    }
    return existingRel;
}

function updateNodesPositions(){
    for (var id in labgraph.body.nodes){
        var mapNode = labgraph.body.nodes[id];
        if (isNodeId(mapNode.id)){
            var node = nodesMap[mapNode.id];
            if (node){
                node.x = mapNode.x;
                node.y = mapNode.y;
                node.width = mapNode.shape.width;
                node.height = mapNode.shape.height;
            }
        }
    }
}
/*
function updateNodesPositions(){
    for (var i = 0; i < graph.nodes.length; i++){
        var node = graph.nodes[i];
        var nodeName = node.data.label;
        var element = nodesMap[nodeName];
        element.x = layout.nodePoints[i].p.x * graphRatio;
        element.y = layout.nodePoints[i].p.y * graphRatio;
    }
}*/

function mainLoop(timestamp){

    var delta = timestamp - lastFrameTimeMs;
    if (delta > 200){
        delta = 200;
    }
    var deltaInSeconds = delta / 1000;

    lastFrameTimeMs = timestamp;
    update(deltaInSeconds);
    //draw();

    requestAnimationFrame(mainLoop);
}

// called after vis renders
function afterDraw(context){
    canvas = context.canvas;

    context.save();
    context.font = "14px Arial";
    context.textBaseline = "middle";
    context.textAlign = "center";
    for (var id in nodesMap){
        var node = nodesMap[id];
        var peopleLeftToShow = node.peopleLeftToShow();
        if (peopleLeftToShow > 0){
            switch (node.state){
                case NodeStateEnum.VISIBLE:
                case NodeStateEnum.APPEARING:
                case NodeStateEnum.DISSAPEARING:
                case NodeStateEnum.SNEAK_PEAK:
                    context.globalAlpha = node.alpha;
                    break;
                case NodeStateEnum.HIDDEN:
                    continue;
            }
            context.fillStyle = "red";
            context.fillRect(node.x + node.width / 2 - 15, node.y - Math.max(node.height/2,30), 20, 20);
            context.fillStyle = "white";
            context.fillText(peopleLeftToShow, node.x + node.width / 2 - 5, node.y - Math.max(node.height/2, 30) + 10);
        }
    }

    context.restore()

    /*
    context.fillRect(10, 10, 10, 10);
    */
}

function draw(){
    /* // springy.js version
    clearCanvas();

    context.save();
    context.translate(camera.x, camera.y);

    for (var id in nodesMap){
        nodesMap[id].draw();
    }

    context.restore();
    */
}

function clearCanvas(){
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function update(delta){

    updateNodesPositions();

    for (var id in nodesMap){
        var node = nodesMap[id];
        node.update(delta);
        if (node.shouldUpdate()){
            datasetNodes.update(node.updateObject);
            node.hasToUpdate = false;
        }
    }

    for (var id in edgesMap){
        var edge = edgesMap[id];
        edge.update(delta);
        if (edge.shouldUpdate()){
            datasetEdges.update(edge.updateObject);
            edge.hasToUpdate = false;
        }
    }

    if (fitFlag){
        fitCamera(fitAnimationFlag);
        fitFlag = false;
        fitAnimationFlag = true;
    }
    /*
    if (focusNode){
        moveTo(focusNode.x, focusNode.y);
    }*/

}

function getEdge(id){
    return edgesMap[id];
}

function getNode(id){
    return nodesMap[id];
}

// function called by the 'hoverNode' event on vis
function hoverNode(event){
    var hoveredNode = nodesMap[event.node];
    hoveredNode.hover = true;
    graphCanvas.style.cursor = "pointer";
    captureMousePosition(event.event);
    hoveredNode.sneakPeakNode();
}

// function called by the 'hoverEdge' event on vis
function hoverEdge(event){
    var hoveredEdge = edgesMap[event.edge];
    hoveredEdge.setHover(true);
}

// function called by the 'blurEdge' event on vis
function blurEdge(event){
    var hoveredEdge = edgesMap[event.edge];
    hoveredEdge.setHover(false);
}

function captureMousePosition(event){
    var rect = canvas.getBoundingClientRect();
    mousePosition.x = clamp(event.clientX - rect.left, 0, canvas.width);
    mousePosition.y = clamp(event.clientY - rect.top, 0, canvas.height);
}

function blurNode(event){
    var blurredNode = nodesMap[event.node];
    blurredNode.hover = false;
    graphCanvas.style.cursor = "default";

    blurredNode.hideSneakPeakNode();
}

// function called after a zoom operation is performed on vis
function afterZoom(zoomInfo){
    if (zoomInfo.scale < fitScale){
        fitFlag = true;
        setPan(false);
    }else{
        setPan(true);
    }
}

// function called after clicking on the node element
function openNodeInfoExternalLink(){
    if (selectedNode){
        var url = selectedNode.getExternalLink();
        window.open(url, "_blank");
    }
}

function setPan(pan){
    labgraph.setOptions({ interaction: {dragView : pan}});
}

function clickOnCanvas(event){
    if (graphState == GraphStateEnum.STEADY){
        if (event.nodes.length > 0){
            clickOnNode(event);
        }
    }
}

function clickOnNode(event){
    var clickedNode = nodesMap[event.nodes[0]];
    clickedNode.click();
}

function filterMap(){
    for (id in nodesMap){
        var node = nodesMap[id];
        if (node.type == NodeTypeEnum.PERSON){
            node.changeState(NodeStateEnum.HIDDEN);
        }
    }
    for (id in edgesMap){
        var edge = edgesMap[id];
        if (edge.edgeType != EdgeTypeEnum.HOSPITAL_HOSPITAL){
            edge.changeState(NodeStateEnum.HIDDEN);
        }
    }
}

function updateMap(){
    for (id in nodesMap){
        // var node = nodesMap[id];
        // nodes.update(node.updateObject);
    }
}

// function called by the UI (selection change)
function dataSourceSelectChange(){
    dataSourceSelect = $('#dataSourceSelect').val();

    // update valid edges of nodes.
    updateValidEdges();
}

function updateValidEdges(){
    for (var id in nodesMap){
        nodesMap[id].updateValidEdges();
    }
}

// function called by the UI (undo button)
function undoAction(){
    if (previousActions.length > 0){
        var lastAction = previousActions.splice(previousActions.length - 1, 1)[0];
        switch (lastAction.action){
            case ActionEnum.SELECT_NODE:
                lastAction.node.deselectNode();
                break;
            case ActionEnum.DESELECT_NODE:
                lastAction.node.selectNode();
                break;
        }
        fitFlag = true;
    }
}

function fitCamera(animation){

    /*
    var boundingBox = { minx : Infinity, maxx : -Infinity, miny : Infinity, maxy : -Infinity};
    for (var id in nodesMap){
        var node = nodesMap[id];
        if (node.x < boundingBox.minx) boundingBox.minx = node.x;
        if (node.x > boundingBox.maxx) boundingBox.maxx = node.x;
        if (node.y < boundingBox.miny) boundingBox.miny = node.y;
        if (node.y > boundingBox.maxy) boundingBox.maxy = node.y;
    }
    boundingBox.minx = boundingBox.minx - GRAPH_MARGIN;
    boundingBox.maxx = boundingBox.maxx - GRAPH_MARGIN;
    boundingBox.miny = boundingBox.miny - GRAPH_MARGIN;
    boundingBox.maxy = boundingBox.maxy - GRAPH_MARGIN;

    camera.x = (boundingBox.maxx + boundingBox.minx) / 2 + canvas.width / 2;
    camera.y = (boundingBox.maxy + boundingBox.miny) / 2 + canvas.height / 2;
    */

    var options = {};
    setPan(false);
    if (animation){
        options.animation = {
            duration: FIT_TIME * 1000,
            easingFunction: "easeInOutQuad"
        };
    }
    labgraph.fit(options);

    if (animation){
        graphState = GraphStateEnum.ANIMATING;
        wait(FIT_TIME, function(){
            fitScale = labgraph.getScale();
            setSteadyGraph();
        });
    }else{
        fitScale = labgraph.getScale();
    }
}

/*canvas.onmousedown = function(){

}*/

const ESCAPE_KEY = 27;
const DEL_KEY = 46;

document.onkeydown = function(event){
    var key = event.keyCode;
    switch (key){
        case ESCAPE_KEY:
        case DEL_KEY:
            //labgraph.deleteSelected();
            break;
    }
}

/* EASING FUNCTIONS */

EasingFunctions = {
    // no easing, no acceleration
    linear: function (t) { return t },
    // accelerating from zero velocity
    easeInQuad: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuad: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuart: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuart: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuint: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuint: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
    easeOutElastic:function(x,t,b,c,d){
        var s=1.70158;
        var p=0;
        var a=c;
        if(t==0)return b;
        if((t/=d)==1)return b+c;if(!p)p=d*.3;
        if(a<Math.abs(c)){ a=c; var s=p/4;}
        else var s=p/(2*Math.PI)*Math.asin(c/a);
        return a*Math.pow(2,-10*t)*Math.sin((t*d-s)*(2*Math.PI)/p)+c+b;
    }
}

function clamp(value, min, max){
    return Math.max(Math.min(value,max),min);
}

function wait(time, callback){
    setTimeout(callback, time * 1000);
}


/* Returns a random value between minValue and maxValue */
function randomUniformDistribution(minValue, maxValue){
    var intervalSize = maxValue - minValue;
    return (minValue + Math.random() * intervalSize);
}
