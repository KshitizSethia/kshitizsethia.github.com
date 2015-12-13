/**
 * Client to the game
 */
var gameStatus;
var bidsForCurrentRound = {};
var winningScore;

function getInitialStatus() {
	return '{                     ' + '    "items": [{                 '
			+ '        "index": 0,             '
			+ '        "type": "t1"            '
			+ '    }, {                        '
			+ '        "index": 1,             '
			+ '        "type": "t2"            '
			+ '    }, {                        '
			+ '        "index": 2,             '
			+ '        "type": "t1"            '
			+ '    }, {                        '
			+ '        "index": 3,             '
			+ '        "type": "t3"            '
			+ '    }],                         '
			+ '    "itemTypeName": {           '
			+ '        "t1": "Ursa",           '
			+ '        "t2": "Bow_e",          '
			+ '        "t3": "Georgie",        '
			+ '        "t4": "Rafiki"          '
			+ '    },                          '
			+ '    "itemFileName": {           '
			+ '        "t1": "img/Ursa.jpg",   '
			+ '        "t2": "img/Bow_e.jpg",  '
			+ '        "t3": "img/Georgie.jpg",'
			+ '        "t4": "img/Rafiki.jpg"  '
			+ '    },                          '
			+ '    "playerStatus": []          ' + '}';
}

function onLoad() {
	gameStatus = JSON.parse(getInitialStatus());
	document.getElementById("button_createHumanPlayer").disabled = false;
	document.getElementById("initial_player_name").disabled = false;
	document.getElementById("player_console").innerHTML = "";
	//document.getElementById("mainWindow").style.visibility = "hidden";
	document.getElementById("instructions").style.display = "block";
	document.getElementById("winningScore").value = 2;
	document.getElementById("winningScore").disabled = false;
	document.getElementById("popup").style.display = "none";
	document.getElementById("popup").innerHTML = "";
	document.getElementById("initial_player_name").focus();
	// document.getElementById("button_createBotPlayer").disabled = false;
	document.getElementById("button_startAuction").disabled = true;
	setupCleanTableRows();
}

function setupCleanTableRows() {
	var colIndex, rowIndex;

	// ----------Item List-----------
	var itemListTable = document.getElementById("itemsTable");

	// remove any elements
	for (rowIndex = itemListTable.rows.length - 1; rowIndex > 0; rowIndex--) {
		itemListTable.deleteRow(rowIndex);
	}

	// add blank rows
	var items = gameStatus.items;
	for (rowIndex = 1; rowIndex <= items.length; rowIndex++) {
		var row = itemListTable.insertRow(rowIndex);
		for (colIndex = 0; colIndex < itemListTable.rows[0].cells.length; colIndex++) {
			row.insertCell(colIndex);
		}
	}

	// ----------Player Status-----------
	var playerStatusTable = document.getElementById("playerTable");
	// remove old data
	playerStatusTable.innerHTML = "";
	// add first Row
	var firstRow = playerStatusTable.createTHead().insertRow(0);
	firstRow.insertCell(0).innerHTML = "Player Name";
	firstRow.insertCell(1).innerHTML = "Amount Left";
	var itemTypes = Object.keys(gameStatus.itemFileName);
	for (colIndex = 2; colIndex < itemTypes.length + 2; colIndex++) {
		var newCell = firstRow.insertCell(colIndex);
		var image = document.createElement("img")
		image.src = gameStatus["itemFileName"][itemTypes[colIndex - 2]];
		image.class = "image";

		image.width = 50;
		newCell.appendChild(image);
		newCell.id = itemTypes[colIndex - 2];
	}
	playerStatusTable.appendChild(firstRow);
}

function generateGuid() {
	return (Math.random() * 10000000000000000).toString();
}

function handlePlayerNameKeyPress(event) {
	if (event.keyCode == 13) {
		createHumanPlayer();
		if (event.ctrlKey) {
			startAuction();
		}
	}
}

function createHumanPlayer() {
	var inputField = document.getElementById("initial_player_name");
	var playerName = inputField.value;
	if (playerName === "") {
		return;
	}
	// todo check for duplicate name
	inputField.value = "";

	var guid = generateGuid();

	var row = document.getElementById("player_console").insertRow(-1);

	row.insertCell(0).innerHTML = playerName;

	var textBoxForPlayer = document.createElement("input");
	textBoxForPlayer.setAttribute("type", "password");
	textBoxForPlayer.id = "bid_" + guid;
	textBoxForPlayer.placeholder = "Enter bid amount";
	textBoxForPlayer.disabled = true;
	textBoxForPlayer.onkeypress = function() {
		if (event.keyCode == 13) {
			registerBid(guid);
		}
	}
	row.insertCell(1).appendChild(textBoxForPlayer);

	var buttonForPlayer = document.createElement("input");
	buttonForPlayer.setAttribute("type", "button");
	buttonForPlayer.id = "button_" + guid;
	buttonForPlayer.value = "Bid";
	buttonForPlayer.disabled = true;
	buttonForPlayer.onclick = function() {
		registerBid(guid);
	};
	row.insertCell(2).appendChild(buttonForPlayer);

	/*
	 * var newPlayer = Player(playerName, guid);
	 * status["playerStatus"].push(newPlayer);
	 */
	var newPlayer = {
		"guid" : guid,
		"name" : playerName,
		"amountLeft" : 100,
		"itemsAcquired" : {}
	};
	gameStatus.playerStatus.push(newPlayer);

	// enable startAuction when 2 players created
	if (gameStatus["playerStatus"].length === 2) {
		document.getElementById("button_startAuction").disabled = false;
	}

	// put player's entry in playerStatus
	var playerStatusTable = document.getElementById("playerTable");
	var newRow = playerStatusTable.insertRow(-1);
	newRow.id = "playerStatus_" + newPlayer.guid;
	newRow.insertCell(0).innerHTML = newPlayer.name;
	newRow.insertCell(1).innerHTML = newPlayer.amountLeft;
	var index;
	for (index = 2; index < playerStatusTable.rows[0].cells.length; index++) {
		newRow.insertCell(index).innerHTML = 0;
	}
}

function startAuction() {
	winningScore = parseInt(document.getElementById("winningScore").value);
	document.getElementById("winningScore").disabled = true;
	document.getElementById("button_createHumanPlayer").disabled = true;
	// document.getElementById("button_createBotPlayer").disabled = true;
	document.getElementById("button_startAuction").disabled = true;
	document.getElementById("initial_player_name").disabled = true;
	document.getElementById("instructions").style.display = "none";

	var firstUnbidItem = updateItemListAndReturnFirstUnbidItem();
	updateItemToBeBid(firstUnbidItem);
	enableBidButtons();
	document.getElementById("mainWindow").style.visibility = "visible";
}

function enableBidButtons() {
	for ( var index in gameStatus.playerStatus) {
		document
				.getElementById("button_" + gameStatus.playerStatus[index].guid).disabled = false;
		document.getElementById("bid_" + gameStatus.playerStatus[index].guid).disabled = false;
	}
	document.getElementById("player_console").rows[0].cells[1].children[0]
			.focus();
}

function registerBid(guid) {
	var inputField = document.getElementById("bid_" + guid);
	var bidAmount = parseFloat(inputField.value);
	inputField.value = "";

	if (isNaN(bidAmount)) {
		window.alert("Not a number!");
		return;
	}

	if (bidAmount < 0) {
		window.alert("No negative Bids");
		return;
	}

	var player = getPlayerFromGuid(guid);

	if (player.amountLeft < bidAmount) {
		window.alert("You don't have that much money!");
		return;
	}

	bidsForCurrentRound[guid] = bidAmount;

	document.getElementById("button_" + player.guid).disabled = true;
	document.getElementById("bid_" + player.guid).disabled = true;

	for (var rowIndex = 0; rowIndex < document.getElementById("player_console").rows.length; rowIndex++) {
		var inputBox = document.getElementById("player_console").rows[rowIndex].cells[1].children[0];
		if (inputBox.disabled === false) {
			inputBox.focus();
			break;
		}
	}

	if (Object.keys(bidsForCurrentRound).length === gameStatus.playerStatus.length) {
		var roundWinner = getWinnerForThisRound();

		var currentBidItem = getItemBeingBidCurrently();
		currentBidItem.winner = roundWinner.name;
		currentBidItem.winningAmount = bidsForCurrentRound[roundWinner.guid];

		roundWinner.amountLeft -= bidsForCurrentRound[roundWinner.guid];
		if (currentBidItem.type in roundWinner.itemsAcquired) {
			roundWinner.itemsAcquired[currentBidItem.type] += 1;
		} else {
			roundWinner.itemsAcquired[currentBidItem.type] = 1;
		}
		updatePlayerStatus();

		bidsForCurrentRound = {};

		var gameWinner = getGameWinner();
		var newItemToBeBid = updateItemListAndReturnFirstUnbidItem();
		if (gameWinner != null) {
			showGameEnd(gameWinner);
		} else if (gameWinner == null && newItemToBeBid == null) {
			showGameOver();
		} else {
			var message = roundWinner.name + " has won this round!";
			showPopup(message, 1000);
			updateItemToBeBid(newItemToBeBid);
			enableBidButtons();
		}
	}
}

function showGameOver() {
	showPopup("Game Over, Nobody won! :/", -1);
	var reset = document.createElement("input");
	reset.type = "button";
	reset.value = "Reset";
	reset.onclick = function() {
		onLoad();
	};
	document.getElementById("popup").appendChild(reset);
}

function showGameEnd(gameWinner) {
	showPopup(gameWinner.name + " has won the game!!", -1);
	var saveScore = document.createElement("input");
	saveScore.type = "button";
	saveScore.value = "Save Score";
	saveScore.onclick = function() {
		saveScore(gameWinner.name, 10);
	};
	saveScore.align = "center";
	document.getElementById("popup").appendChild(saveScore);

	var reset = document.createElement("input");
	reset.type = "button";
	reset.value = "Reset";
	reset.align = "center";
	reset.onclick = function() {
		onLoad();
	};
	document.getElementById("popup").appendChild(reset);
}

function saveScore(winnerName, score) {
	window.alert("save score called with " + winnerName + score);
}

function getGameWinner() {
	for ( var playerIndex in gameStatus.playerStatus) {
		var player = gameStatus.playerStatus[playerIndex];
		for ( var itemType in player.itemsAcquired) {
			if (player.itemsAcquired[itemType] === winningScore) {
				return player;
			}
		}
	}
	return null;
}

function getItemBeingBidCurrently() {
	for ( var index in gameStatus.items) {
		var item = gameStatus.items[index];
		if (!("winner" in item)) {
			return item;
		}
	}
}

function showPopup(message, timeout) {
	var popup = document.getElementById("popup");
	popup.style.display = "block";
	popup.innerHTML = "<h3 align='center'>" + message + "</h3>";
	if (timeout > 0) {
		setTimeout(function() {
			popup.style.display = "none";
			popup.innerHTML = "";
		}, timeout);
	}
}

function getWinnerForThisRound() {
	// find out winning player's guid
	var winningGuid;
	var winningAmount = -1;
	for ( var guid in bidsForCurrentRound) {
		if (bidsForCurrentRound[guid] > winningAmount) {
			winningAmount = bidsForCurrentRound[guid];
			winningGuid = guid;
		}
	}
	// return winning player
	for ( var index in gameStatus.playerStatus) {
		if (winningGuid === gameStatus.playerStatus[index].guid) {
			return gameStatus.playerStatus[index];
		}
	}
}

function getPlayerFromGuid(guid) {
	for ( var index in gameStatus.playerStatus) {
		if (gameStatus.playerStatus[index].guid === guid) {
			return gameStatus.playerStatus[index];
		}
	}
}

function getStatusJson() {
	return '';
}

function updateItemListAndReturnFirstUnbidItem() {
	var itemListTable = document.getElementById("itemsTable");
	var index;
	var firstUnbidItem;

	for (index = 0; index < gameStatus.items.length; index++) {
		var row = itemListTable.rows[index + 1];
		row.cells[0].innerHTML = gameStatus.items[index].index;

		var itemType = gameStatus.items[index].type;
		row.cells[1].innerHTML = gameStatus.itemTypeName[itemType];

		if ("winner" in gameStatus.items[index]) {
			row.cells[2].innerHTML = gameStatus.items[index].winner;
			row.cells[3].innerHTML = gameStatus.items[index].winningAmount;
		} else if (firstUnbidItem == null) {
			firstUnbidItem = gameStatus.items[index];
		}
	}

	return firstUnbidItem;
}

function updateItemToBeBid(firstUnbidItem) {
	var itemType;
	if (firstUnbidItem == null) {
		img.src("empty.png");
	} else {
		itemType = firstUnbidItem.type;
		img = document.getElementById("bidImage");
		img.src = gameStatus.itemFileName[itemType];
	}
}

function updatePlayerStatus() {
	var itemTypes = Object.keys(gameStatus.itemTypeName);
	playerTable = document.getElementById("playerTable")
	// add player status
	for (var rowIndex = 1; rowIndex < playerTable.rows.length; rowIndex++) {
		var row = playerTable.rows[rowIndex];
		var rowGuid = row.id.split("_")[1];

		var player = getPlayerFromGuid(rowGuid);

		row.cells[0].innerHTML = player.name;
		row.cells[1].innerHTML = player.amountLeft;

		var columnIndex;
		for (columnIndex = 2; columnIndex < itemTypes.length + 2; columnIndex++) {
			itemTypeOfColumn = playerTable.rows[0].cells[columnIndex].id;

			if (itemTypeOfColumn in player.itemsAcquired) {
				row.cells[columnIndex].innerHTML = player.itemsAcquired[itemTypeOfColumn];
			} else {
				row.cells[columnIndex].innerHTML = 0;
			}
		}
	}
}