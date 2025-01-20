import React from "react";
import axios from "axios";
import PropTypes from "prop-types";

function Tocheckout({ totalprice }) {
    const price = totalprice.toString()
    const checkout = async () => {
        await axios
            .post("http://localhost:8000/api/payments/createOrder", {
                amount: price,
                currency: "ETB",
                email: "john.doe@example.com",
                first_name: "John",
                last_name: "Doe",
                phone_number: "+251912345678",
                returnUrl: "http://localhost:5173/",
                callbackUrl: "http://localhost:5173/",
                title: "payment",
                rdurl: "http://localhost:5173",
            })
            .then((res) => {
                console.log(res.data);
                
                const chekouturl = res?.data?.checkoutUrl;
                chekouturl && window.location.replace(chekouturl);
            });
    };
    return (
        <div
            className="bg-[#fe9d34] h-[3.25em] flex justify-center items-center text-white text-xl"
            onClick={() => (totalprice == 0 ? alert("pls add sth") : checkout())}
        >
            To checkout
        </div>
    );
}
Tocheckout.propTypes = {
    totalprice: PropTypes.number.isRequired,
};

export default Tocheckout;