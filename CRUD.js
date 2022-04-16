//add all code that does what we want it to do
//create class for rooms and houses
//create class for house service that enables us to send http request to preexisting api
//class for DOM (clear)


class House {
    constructor(name) {
        this.name = name;
        this.rooms= [];
    }

    addRoom(name, area) {
        this.rooms.push(new Room(name, area)); //adds room to array in House class
    }
}


class Room {
    constructor(name, area){
        this.name = name;
        this.area = area;

    }
}

class HouseService { //send HTTP request
    static url = "https://ancient-taiga-31359.herokuapp.com/api/houses";

    //create methods and return so we can use these methods and the promise that comes back

    static getAllHouses() {
        return $.get(this.url); //return all houses from that url (jquery)

    }

    static getHouse(id) {
        return $.get(this.url + `/${id}`);

    }

    static createHouse(house){
        return $.post(this.url, house);//post house to API
    }

    static updateHouse(house) { //send request
        return $.ajax({
            url: this.url + `/${house._id}`, //_id this is the value that database reates for house... mongodatabase
            dataType: 'json',
            data: JSON.stringify(house),
            contentType: 'application/json',
            type: 'PUT'
        
        }); //use ajax method
    }

    static deleteHouse(id) {
        return $.ajax({
            url: this.url + `/${id}`,
            type: 'DELETE'
        });
    }
}

//use houseservice class in DOM manager class
//rerender or repaint DOM each time we create a new class

class DOMManager {
    static houses; //variable to represent all houses in this class

    static getAllHouses() { //calls getallhouses method in houseserviceclass and rerenders the dom
        //top down and call methods that we havent created yet
        HouseService.getAllHouses().then(houses => this.render(houses)); //returns a promise so use.then 
        //render does not exist yet 
    
    }

    static deleteHouse(id) {
        HouseService.deleteHouse(id) //delete house
            .then(() => {
                return HouseService.getAllHouses(); //send http request: once we delete the house, get all houses again, then render those houses again
            })
            .then((houses) => this.render(houses)); //re-render 
    }

    static createHouse(name) {
        HouseService.createHouse(new House(name))
            .then(() =>{
                return HouseService.getAllHouses();
            })
            .then((houses) => this.render(houses));
    }

    static addRoom(id) {
        for (let house of this.houses){
            if(house._id == id) {
                house.rooms.push(new Room($(`#${house._id}-room-name`).val(), $(`#${house._id}-room-area`).val())); //$ is jquery then template literal  then jquery for id is #
                HouseService.updateHouse(house) 
                    //send updated request to API to save new data
                    .then(() => {
                        return HouseService.getAllHouses();
                    })
                    .then((houses) => this.render(houses));
                }
            }
        }
    
    static deleteRoom(houseId, roomId) {
        for(let house of this.houses) {
            if(house._id == houseId) {
                for(let room  of house.rooms) {
                    if(room._id == roomId){
                        house.rooms.splice(house.rooms.indexOf(room), 1);
                        HouseService.updateHouse(house)
                            .then(() => {
                                return HouseService.getAllHouses();

                            })
                            .then((houses) => this.render(houses));
                    }
                }
            }
        }
    }


    //Build RENDER METHOD
    static render(houses) {
        this.houses = houses;
        $('#app').empty(); //grab reference to div and render everything
        //for loop to go over houses and rerender
        for (let house of houses) {
            $('#app').prepend( //write html in js use backticks
                `<div id="${house._id}" class="card">
                    <div class="card-header">
                        <h2>${house.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteHouse('${house._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${house._id}-room-name" class="form-control" placeholder="Room Name">
                                    
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${house._id}-room-area" class="form-control" placeholder="Room Area">
                                </div>
                            </div>
                            <button id="${house._id}-new-room" onclick="DOMManager.addRoom('${house._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
                //nested loop to render each room inside the house

            );
                for(let room of house.rooms){
                    $(`#${house._id}`).find('.card-body').append(
                        `<p>
                            <span id="name-${room._id}"><strong>Name: </strong> ${room.name}</span>
                            <span id="area-${room._id}"><strong>Area: </strong> ${room.area}</span>
                            <button class="btn btn-danger" onclick="DOMManager.deleteRoom('${house._id}', '${room._id}')">Delete Room</button>

                        `
                    )
                }
        }
    }
}


$('#create-new-house').click(() => {
    DOMManager.createHouse($('#new-house-name').val());
    $('#new-house-name').val(' ');
})

//add buttons delete house, add room, delete room; add above the render of houses



//TEST

DOMManager.getAllHouses();



