const monday = window.mondaySdk();

async function getBoardsItemsAndGroups() {
    var mondayBoards = await monday.api(`query {
        boards(limit:100){
  		    id
    	    name
            groups{
                id
                title
                color
            }
        }
    }`).then((result) => {
        return result.data.boards;
    });

    var mondayItems = await monday.api(`query {
        items(limit:500){
            id
            name
            group {
                id
                title
            }
            board {
                id
                name
            }
          }
    }`).then((result) => {
        return result.data.items;
    });

    var mondayUsers = await monday.api(`query {
        users {
            id
            name
            photo_tiny
        }
    }`).then((result) => {
        return result.data.users;
    });

    var boards = {};
    var items = {};
    var users = {};

    mondayBoards.forEach(board => {
        boards[board.id] = {
            id: parseInt(board.id),
            name: board.name,
            groups: {},
            items: []
        };

        board.groups.forEach(group => {
            boards[board.id].groups[group.id] = {
                id: group.id,
                title: group.title,
                color: group.color,
                items: []
            };
        });
    });

    mondayItems.forEach(item => {
        if(Object.keys(boards).includes(item.board.id)){
            boards[item.board.id].items.push({
                id: parseInt(item.id),
                name: item.name
            });
            if(Object.keys(boards[item.board.id].groups).includes(item.group.id)){
                boards[item.board.id].groups[item.group.id].items.push({
                    id: parseInt(item.id),
                    name: item.name
                });
                items[item.id] = item;
            }
        }
    });

    mondayUsers.forEach(user => {
        // Save item in items object
        users[user.id] = user;
    });

    return { boards: boards, items: items, users: users };
}


// async function getBoardsItemsAndGroups(){
//     return await monday.api(`query {
//         items(limit:200){
//             id
//             name
//             board{
//                 id
//                 name
//             }
//             group {
//                 id
//                 title
//                 color
//             }
//         }
//         users {
//             id
//             name
//             photo_tiny
//         }
//     }`).then((result) => {
//         var boards = {};
//         var items = {};
//         var users = {};
//         result.data.items.forEach(item => {
//             // Save item in items object
//             items[item.id] = item;

//             // Check path for board is defined
//             if (boards[item.board.id] === undefined) {
//                 boards[item.board.id] = {
//                     id: parseInt(item.board.id),
//                     name: item.board.name,
//                     groups: {},
//                     items: []
//                 };
//             }

//             // Check path for group within board is defined
//             if(boards[item.board.id].groups[item.group.id] === undefined){
//                 boards[item.board.id].groups[item.group.id] = {
//                     id: item.group.id,
//                     title: item.group.title,
//                     color: item.group.color,
//                     items: []
//                 };
//             }

//             // Store item in groups and boards dict
//             boards[item.board.id].groups[item.group.id].items.push({
//                 id: parseInt(item.id),
//                 name: item.name
//             });
//             boards[item.board.id].items.push({
//                 id: parseInt(item.id),
//                 name: item.name
//             });
//         });
//         result.data.users.forEach(user => {
//             // Save item in items object
//             users[user.id] = user;
//         });
//         return {boards: boards, items: items, users: users};
//     });
// }

// Get all boards, board ids and board names from current user
async function getAllBoards() {
    // Query all board names
    return await monday.api(`query {
        boards{
          id
          name
        }
    }`).then((result) => {
        return result.data.boards;
    });
}

// Get all groups from certain board id
async function getGroups(board_id) {
    // Query all board names
    return await monday.api(`query {
        boards(ids:[${board_id}]){
            groups{
                id
                title
            }
        }
    }`).then((result) => {
        return result.data.boards[0].groups;
    });
}

// Get all boards and board items
async function getItemsByBoard() {
    return await monday.api(`query {
        boards{
            id
            name
            items{
                id
                name
          }
        }
    }`).then((result) => {
        return result.data.boards;
    });
}

// Get all groups and group items from certain board id
// Queries all items on board, then refactors into group:items obj 
// since querying group by itself has too high of a complexity level
async function getItemsByGroup(boardId) {
    // Query all board names
    return await monday.api(`query {
        boards(ids:[${boardId}]){
          items{
              id
              name
              group{
                id
                title
                color
              }
          }
        }
    }`).then((result) => {
        var groups = {};
        result.data.boards[0].items.forEach(item => {
            if (groups[item.group.id] === undefined) {
                groups[item.group.id] = {
                    id: item.group.id,
                    title: item.group.title,
                    color: item.group.color,
                    items: []
                };
            }
            groups[item.group.id].items.push({
                id: item.id,
                name: item.name,
                groupName: item.group.name,
                groupColor: item.group.color
            });
        });
        return groups;
    });
}

// Get all items
async function getItems() {
    // Query all board names
    return await monday.api(`query {
        items(limit:200){
            id
            name
            group{
                title
                color
            }
            board{
                name
            }
        }
    }`).then((result) => {
        return result.data.items;
    });
}

// Get parent board item belongs too
async function getParentBoard(itemId) {
    return await monday.api(`query {
        items(ids:[${itemId}]){
            board{
                id
                name
          }
        }
    }`).then((result) => {
        return result.data.items[0].board;
    });
}

// Get parent board item belongs too
async function getItemName(itemId) {
    return await monday.api(`query {
        items(ids:[${itemId}]){
            name
        }
    }`).then((result) => {
        return result.data.items[0].name;
    });
}

async function getItem(itemId) {
    return await monday.api(`query {
        items(ids:[${itemId}]){
            id
            name
        }
    }`).then((result) => {
        return result.data.items[0];
    });
}


// Get board items
async function getBoardItems(boardId) {
    // Query all board names
    return await monday.api(`query {
        boards(ids:[${boardId}]){
            id
            name
            items{
                id
                name
            }
        }
    }`).then((result) => {
        return result.data.boards[0];
    });
}

// Get users
async function getUsers() {
    // Query all board names
    return await monday.api(`query {
        users{
            id
            name
            photo_tiny
        }
    }`).then((result) => {
        return result.data.users;
    });
}