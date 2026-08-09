import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
    userId: {type:String,required:true},
    items: {type:Array,required:true},
    amount: {type:Number,required:true},
    address:{type:Object,required:true},
    date: {type:Date,default:Date.now},
    status: {type:String,default:"Food Processing"},
    payment: {type:Boolean,default:false},
    deliveryBoy: {
        id: {type: String, default: ""},
        name: {type: String, default: ""},
        phone: {type: String, default: ""},
        vehicle: {type: String, default: ""},
        avatar: {type: String, default: ""}
    },
    deliveryBoyLocation: {
        lat: {type: Number, default: 28.6139},
        lng: {type: Number, default: 77.2090}
    },
    restaurantLocation: {
        lat: {type: Number, default: 28.6139},
        lng: {type: Number, default: 77.2090}
    },
    userLocation: {
        lat: {type: Number, default: 28.6250},
        lng: {type: Number, default: 77.2180}
    }
})

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);
export default orderModel;

