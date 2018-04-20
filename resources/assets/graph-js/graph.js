
//var canvas = document.getElementById('graphCanvas');
//var context = canvas.getContext('2d');
//var canvasWidth = 600;
//var canvasHeight = 400;
//var graphRatio = 15;
//var camera = { x : canvas.width / 2, y : canvas.height / 2};

var mainLabId;

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

var graphState = 0;
var dataSourceSelect = [];
var selectedNode = null;

var hospitals = [];
var people = [];
var hospitalConnections = [];
var personHospitalConnections = [];
var peopleConnections = [];
var physicsOptions = { enabled : true, /*, timestep : 0.66, minVelocity : 0.75,*/ barnesHut: { gravitationalConstant: -20000, springConstant: 0.04, avoidOverlap: 1, damping: 0.91 }, stabilization : false };
var hoverPhysicsOptions = { enabled : false, stabilization : { enabled : true } };

function resetValues() {
    BASE_URL = "http://localhost/~pdeboer/roche_labs/";

    previousActions = [];

    GRAPH_MARGIN = 10;
    MAX_LETTERS_PER_LABEL_LINE = 20;
    graphCanvas = null;

//state = MapViewStateEnum.STABILIZING;
    nodesMap = {};
    edgesMap = {};
    datasetEdges = null;
    datasetNodes = null;
    lastFrameTimeMs = 0;
    APPEAR_FADE_TIME = 1.2;
    DISSAPEAR_FADE_TIME = 0.5;
    OFFSET_FADE_TIME = 0.1;
    FIT_TIME = 1;
    fitFlag = false;
    fitAnimationFlag = true;
    focusNode = null;
    tFullScreen = false;
    SNEAK_PEAK_ALPHA = 0.3;
    canvas;
    hasStabilization = true;

    fitScale = 0;
    mousePosition = { x : -10000, y : -10000 };

    graphState = 0;
    dataSourceSelect = [];
    selectedNode = null;

    hospitals = [];
    people = [];
    hospitalConnections = [];
    personHospitalConnections = [];
    peopleConnections = [];
    physicsOptions = { enabled : true, /*, timestep : 0.66, minVelocity : 0.75,*/ barnesHut: { gravitationalConstant: -20000, springConstant: 0.04, avoidOverlap: 1, damping: 0.91 }, stabilization : false };
    hoverPhysicsOptions = { enabled : false, stabilization : { enabled : true } }
}

GraphStateEnum = {
    STABILIZING : 0,
    STEADY : 1,
    ANIMATING : 2
}

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
            // $('#workerTypeSelect').material_select();

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

    resetValues();

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
        // console.log(rel);
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
        var node = nodesMap[id];
        node.update(node.updateObject);
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
