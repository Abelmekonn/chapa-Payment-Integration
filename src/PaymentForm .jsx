import React, { useState } from 'react';
import { BsCheck2Circle } from "react-icons/bs";
import { IoIosCloseCircleOutline } from "react-icons/io";

const PaymentForm = () => {
    const [formData, setFormData] = useState({
        amount: '',
        currency: 'ETB',
        email: '',
        first_name: '',
        last_name: '',
        phone_number: '',
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // POST request to the payment API
            const response = await fetch('http://localhost:8000/api/payments/accept-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Payment failed');
            }

            const data = await response.json();
            if (
                data.chapaResponse.status === 'success'
            ) {
                console.log(data)
                setIsSuccess(true);
                setModalMessage('Payment Successful!');
            }
        } catch (error) {
            setIsSuccess(false);
            setModalMessage('Payment Failed. Please try again.');
        } finally {
            setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <div>
            <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 border rounded shadow">
                <h2 className="text-xl font-bold mb-4">Payment Form</h2>

                <div className="mb-4">
                    <label htmlFor="email" className="block font-medium mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="first_name" className="block font-medium mb-1">
                        First Name
                    </label>
                    <input
                        type="text"
                        id="first_name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="last_name" className="block font-medium mb-1">
                        Last Name
                    </label>
                    <input
                        type="text"
                        id="last_name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="phone_number" className="block font-medium mb-1">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        id="phone_number"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="amount" className="block font-medium mb-1">
                        Amount
                    </label>
                    <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="currency" className="block font-medium mb-1">
                        Currency
                    </label>
                    <select
                        id="currency"
                        name="currency"
                        value={formData.currency}
                        onChange={handleChange}
                        className="w-full p-2 border rounded"
                        required
                    >
                        <option value="ETB">ETB</option>
                        <option value="USD">USD</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                >
                    Submit Payment
                </button>
            </form>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center ">
                        {isSuccess ? (
                            <div className="text-xl mb-4 text-green-500">
                                <BsCheck2Circle className="inline-block text-4xl mb-2" />
                                {modalMessage}
                            </div>
                        ) : (
                            <div className="text-xl mb-4 text-red-700">
                                <IoIosCloseCircleOutline className="inline-block text-4xl mb-2" />
                                {modalMessage}
                            </div>
                        )}
                        <button
                            onClick={closeModal}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};


export default PaymentForm;
