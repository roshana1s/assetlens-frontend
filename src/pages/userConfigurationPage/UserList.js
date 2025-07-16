import React, { useState, useEffect, useRef } from "react";
import {
    fetchAllUsers,
    deleteUser,
    updateUser,
    createUser,
    fetchAllRoles,
    createRole,
    deleteRole,
} from "./api";
import "./UserConfiguration.css";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FetchingData from "../../components/FetchingData/FetchingData";

const UserList = ({ orgId = 1 }) => {
    // State management
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [allAssets, setAllAssets] = useState([]);

    // Modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRoleManagementModal, setShowRoleManagementModal] =
        useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [confirmationName, setConfirmationName] = useState("");
    const [newRoleName, setNewRoleName] = useState("");

    // Form states
    const [editForm, setEditForm] = useState({
        name: "",
        role_id: "",
        image_link: "",
        tempImage: null,
        selectedAssets: [],
    });

    const [addForm, setAddForm] = useState({
        name: "", // Maps to startmsg
        email: "", // Maps to result1
        password: "", // Will use default if empty
        role_id: "", // Required
        image_link: "", // Maps to longo_link
        selectedAssets: [], // For your asset assignment
    });

    const fileInputRef = useRef();

    // Load data
    useEffect(() => {
        const loadData = async () => {
            try {
                const [usersData, rolesData] = await Promise.all([
                    fetchAllUsers(orgId),
                    fetchAllRoles(orgId),
                ]);

                // Extract all unique assets from users
                const assetsSet = new Set();
                usersData.forEach((user) => {
                    if (user.assets && user.assets.length > 0) {
                        user.assets.forEach((asset) => {
                            const assetId =
                                typeof asset === "object"
                                    ? asset.asset_id
                                    : asset;
                            const assetName =
                                typeof asset === "object"
                                    ? asset.name || asset.asset_name
                                    : asset;
                            assetsSet.add(
                                JSON.stringify({ id: assetId, name: assetName })
                            );
                        });
                    }
                });

                const uniqueAssets = Array.from(assetsSet).map((item) =>
                    JSON.parse(item)
                );

                setAllUsers(usersData);
                setFilteredUsers(usersData);
                setRoles(rolesData);
                setAllAssets(uniqueAssets);
            } catch (error) {
                console.error("Error loading data:", error);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [orgId]);

    // Filter users based on search term and selected roles
    useEffect(() => {
        let result = allUsers;

        // Apply role filter if any roles are selected
        if (selectedRoles.length > 0) {
            result = result.filter((user) =>
                selectedRoles.includes(user.role_id)
            );
        }

        // Apply search filter
        if (searchTerm) {
            result = result.filter((user) =>
                user.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(result);
    }, [searchTerm, selectedRoles, allUsers]);

    // Role filter handler
    const handleRoleToggle = (roleId) => {
        setSelectedRoles((prev) =>
            prev.includes(roleId)
                ? prev.filter((id) => id !== roleId)
                : [...prev, roleId]
        );
    };

    // Add new role handler
    const handleAddRole = async () => {
        const roleName = newRoleName.trim();

        // Client-side validation
        if (!roleName) {
            toast.error("Role name cannot be empty");
            return;
        }

        if (roleName.length < 2) {
            toast.error("Minimum 2 characters required");
            return;
        }

        try {
            await createRole(orgId, roleName);

            // Update UI
            setRoles((prev) => [
                ...prev,
                {
                    role_id: `new-${Date.now()}`,
                    role_name: roleName,
                    is_admin: false,
                    is_deleted: false,
                },
            ]);
            toast.success(`Created role: ${roleName}`);
            setNewRoleName("");
        } catch (error) {
            toast.error("Failed to add Role");
        }
    };

    // Delete role handler
    const handleDeleteRole = async (roleId) => {
        try {
            await deleteRole(orgId, roleId);
            const updatedRoles = await fetchAllRoles(orgId);
            setRoles(updatedRoles);
            toast.success("Role Deleted successfully");

            // Remove from selected roles if it was selected
            setSelectedRoles((prev) => prev.filter((id) => id !== roleId));
        } catch (error) {
            console.error("Error deleting role:", error);
            toast.error(
                error.message ||
                    "Failed to delete the role, Role maybe assigned to someone!"
            );
        }
    };

    // Edit user handler
    const handleEditClick = (user) => {
        const userAssetIds = (user.assets || []).map((asset) =>
            typeof asset === "object" ? asset.asset_id : asset
        );

        setCurrentUser(user);
        setEditForm({
            name: user.name,
            role_id: user.role_id,
            image_link: user.image,
            tempImage: null,
            selectedAssets: userAssetIds,
        });
        setShowEditModal(true);
    };

    const handleEditConfirm = async () => {
        try {
            await updateUser(orgId, currentUser.user_id, {
                name: editForm.name,
                role_id: editForm.role_id,
                image_link: editForm.tempImage || editForm.image_link,
                assets: editForm.selectedAssets,
            });

            const data = await fetchAllUsers(orgId);
            setAllUsers(data);
            setFilteredUsers(data);
            setShowEditModal(false);
            toast.success("User updated successfully");
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("User update failed");
        }
    };

    // Delete user handler
    const handleDeleteClick = (user) => {
        setCurrentUser(user);
        setConfirmationName("");
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (confirmationName !== currentUser?.name) return;

        try {
            setDeleteLoading(true);

            const userId = currentUser.user_id;
            const response = await deleteUser(orgId, userId);

            if (
                response &&
                (response.message === "User deleted successfully" ||
                    !response.detail)
            ) {
                const updatedUsers = allUsers.filter(
                    (user) => user.user_id !== userId
                );
                setAllUsers(updatedUsers);
                setFilteredUsers(updatedUsers);

                setShowDeleteModal(false);
                setConfirmationName("");
                toast.success("User deleted successfully");
                return;
            }

            if (response && response.detail) {
                if (
                    response.detail ===
                    "User has assigned assets and cannot be deleted"
                ) {
                    throw new Error("Cannot delete user with assigned assets");
                }

                if (response.detail === "User not found or already deleted") {
                    const data = await fetchAllUsers(orgId);
                    setAllUsers(data);
                    setFilteredUsers(data);
                    throw new Error("User was already deleted");
                }

                throw new Error(response.detail);
            }

            throw new Error("Failed to delete user");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(error.message || "User delete failed");

            if (error.message === "User was already deleted") {
                setShowDeleteModal(false);
                setConfirmationName("");
            }
        } finally {
            setDeleteLoading(false);
        }
    };

    // Asset selection handlers
    const handleAddAssetChange = (assetId) => {
        setAddForm((prev) => {
            const newSelectedAssets = [...prev.selectedAssets];

            if (newSelectedAssets.includes(assetId)) {
                return {
                    ...prev,
                    selectedAssets: newSelectedAssets.filter(
                        (id) => id !== assetId
                    ),
                };
            } else {
                return {
                    ...prev,
                    selectedAssets: [...newSelectedAssets, assetId],
                };
            }
        });
    };

    const handleEditAssetChange = (assetId) => {
        setEditForm((prev) => {
            const newSelectedAssets = [...prev.selectedAssets];

            if (newSelectedAssets.includes(assetId)) {
                return {
                    ...prev,
                    selectedAssets: newSelectedAssets.filter(
                        (id) => id !== assetId
                    ),
                };
            } else {
                return {
                    ...prev,
                    selectedAssets: [...newSelectedAssets, assetId],
                };
            }
        });
    };

    // Add user handler
    const handleAddClick = () => {
        setAddForm({
            name: "",
            email: "",
            password: "",
            role_id: "",
            image_link: "",
            selectedAssets: [],
        });
        setShowAddModal(true);
    };

    const handleAddConfirm = async () => {
        // Client-side validation
        if (!addForm.name.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!addForm.role_id) {
            toast.error("Role is required");
            return;
        }

        try {
            // Fix: Ensure we're using the correct property name for assets
            await createUser(orgId, {
                name: addForm.name,
                email: addForm.email,
                password: addForm.password,
                role_id: addForm.role_id,
                image_link: addForm.image_link,
                assets: addForm.selectedAssets, // Key fix: Ensure the assets are properly provided
                assigned_assets: addForm.selectedAssets, // Adding this as backup since API might check both
            });

            // Success handling
            const data = await fetchAllUsers(orgId);
            setAllUsers(data);
            setFilteredUsers(data);
            setShowAddModal(false);
            toast.success("User created successfully");

            // Reset form
            setAddForm({
                name: "",
                email: "",
                password: "",
                role_id: "",
                image_link: "",
                selectedAssets: [],
            });
        } catch (error) {
            console.error("Create User Error:", error);
            toast.error("User create error");
        }
    };

    // Image upload handler
    const handleImageUpload = (e, formType) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (formType === "edit") {
                    setEditForm((prev) => ({
                        ...prev,
                        tempImage: reader.result,
                    }));
                } else {
                    setAddForm((prev) => ({
                        ...prev,
                        image_link: reader.result,
                    }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteImage = () => {
        setEditForm((prev) => ({
            ...prev,
            tempImage: null,
            image_link: "",
        }));
    };

    if (loading) return <FetchingData />;

    return (
        <>
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} />

            <div style={{ display: "flex" }}>
                <div className="user-config-container">
                    <span className="header-text">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            className="bi bi-people"
                            viewBox="0 0 16 16"
                        >
                            <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4" />
                        </svg>
                        <span className="ms-2">User Configuration</span>
                    </span>

                    {/* Sidebar with Role Filter */}
                    <div className="role-filter-container">
                        <div className="filter-header">
                            <h3 className="filter-title">Filter</h3>
                        </div>

                        {/* Search moved to filter section */}
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search Users Here"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>

                        <div className="role-header">
                            <h4 className="role-title">User role</h4>
                            <button
                                className="edit-role-btn"
                                onClick={() => setShowRoleManagementModal(true)}
                            >
                                <svg
                                    className="edit-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                    ></path>
                                </svg>
                            </button>
                        </div>

                        <div className="role-checkbox-list">
                            {roles.map((role) => (
                                <div
                                    key={role.role_id}
                                    className="role-checkbox-item"
                                >
                                    <input
                                        type="checkbox"
                                        id={`role-${role.role_id}`}
                                        checked={selectedRoles.includes(
                                            role.role_id
                                        )}
                                        onChange={() =>
                                            handleRoleToggle(role.role_id)
                                        }
                                        className="role-checkbox"
                                    />
                                    <label
                                        htmlFor={`role-${role.role_id}`}
                                        className="role-checkbox-label"
                                    >
                                        <span
                                            className={`checkbox-custom ${
                                                selectedRoles.includes(
                                                    role.role_id
                                                )
                                                    ? "checked"
                                                    : ""
                                            }`}
                                        >
                                            {selectedRoles.includes(
                                                role.role_id
                                            ) && (
                                                <svg
                                                    className="checkmark"
                                                    fill="none"
                                                    stroke="white"
                                                    viewBox="0 0 24 24"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="3"
                                                        d="M5 13l4 4L19 7"
                                                    ></path>
                                                </svg>
                                            )}
                                        </span>
                                        {role.role_name}
                                    </label>
                                </div>
                            ))}
                        </div>

                        <button
                            className="add-user-btn"
                            onClick={handleAddClick}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                fill="currentColor"
                                className="bi bi-plus-circle"
                                viewBox="0 0 16 16"
                                style={{ marginRight: "8px" }}
                            >
                                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3H4a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                            </svg>
                            Add New User
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* User List */}
                    {filteredUsers.length === 0 ? (
                        <p className="no-users">
                            {searchTerm || selectedRoles.length > 0
                                ? "No matching users found"
                                : "No users found"}
                        </p>
                    ) : (
                        <div className="compact-user-list">
                            {filteredUsers.map((user) => (
                                <div
                                    key={user.user_id}
                                    className="compact-user-item"
                                >
                                    <div className="compact-user-info">
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name}
                                                className="compact-user-avatar"
                                            />
                                        ) : (
                                            <div className="compact-avatar-fallback">
                                                {user.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div className="compact-user-details">
                                            <div className="compact-user-name">
                                                {user.name}
                                            </div>
                                            <div className="compact-user-role">
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="compact-user-actions">
                                        <button
                                            className="action-btn edit-btn"
                                            onClick={() =>
                                                handleEditClick(user)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-pencil-square"
                                                viewBox="0 0 16 16"
                                                style={{ marginRight: "4px" }}
                                            >
                                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                                <path
                                                    fillRule="evenodd"
                                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                                />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            className="action-btn delete-btn"
                                            onClick={() =>
                                                handleDeleteClick(user)
                                            }
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="16"
                                                height="16"
                                                fill="currentColor"
                                                className="bi bi-trash3"
                                                viewBox="0 0 16 16"
                                                style={{ marginRight: "4px" }}
                                            >
                                                <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Updated Role Management Modal - Bootstrap */}
            <Modal
                show={showRoleManagementModal}
                onHide={() => {
                    setShowRoleManagementModal(false);
                    setNewRoleName("");
                    setRoleToDelete(null);
                }}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Role Management</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="roles-list">
                        {roles.map((role) => (
                            <div key={role.role_id} className="role-item">
                                <div className="role-name">
                                    {role.role_name}
                                </div>
                                <button
                                    className="role-delete-btn"
                                    onClick={() =>
                                        handleDeleteRole(role.role_id)
                                    }
                                    title="Delete Role"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="add-role-section">
                        <Form.Control
                            type="text"
                            placeholder="Enter new role name"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="role-input"
                        />
                        <Button
                            variant="success"
                            onClick={handleAddRole}
                            className="add-role-btn"
                        >
                            <span className="add-icon">+</span> Add Role
                        </Button>
                    </div>
                </Modal.Body>
            </Modal>

            {/* Delete User Modal - Bootstrap */}
            <Modal
                show={showDeleteModal}
                onHide={() => {
                    setShowDeleteModal(false);
                    setConfirmationName("");
                }}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Delete User: {currentUser?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Type "<strong>{currentUser?.name}</strong>" below to
                        confirm deletion
                    </p>
                    <Form.Control
                        type="text"
                        placeholder="Enter User Name Here"
                        value={confirmationName}
                        onChange={(e) => setConfirmationName(e.target.value)}
                        disabled={deleteLoading}
                    />
                    <div className="mt-3">
                        <small className="text-muted">
                            This action cannot be undone. Deleting this user
                            will permanently remove all associated data.
                        </small>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowDeleteModal(false);
                            setConfirmationName("");
                        }}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDeleteConfirm}
                        disabled={
                            confirmationName !== currentUser?.name ||
                            deleteLoading
                        }
                    >
                        {deleteLoading ? "Deleting..." : "Confirm deletion"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Edit User Modal - Bootstrap */}
            <Modal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Edit User: {editForm.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="user-info-section">
                        <h5 className="section-title">User Information</h5>
                        <Form.Group className="mb-3">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editForm.name}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Role</Form.Label>
                            <Form.Select
                                value={editForm.role_id}
                                onChange={(e) =>
                                    setEditForm({
                                        ...editForm,
                                        role_id: e.target.value,
                                    })
                                }
                            >
                                <option value="">Select a role</option>
                                {roles.map((role) => (
                                    <option
                                        key={role.role_id}
                                        value={role.role_id}
                                    >
                                        {role.role_name}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </div>

                    <div className="profile-image-section">
                        <h5 className="section-title">Profile Image</h5>
                        <div className="profile-image-container">
                            <div className="profile-image-wrapper">
                                {editForm.tempImage ? (
                                    <img
                                        src={editForm.tempImage}
                                        alt="User"
                                        className="profile-image"
                                    />
                                ) : editForm.image_link ? (
                                    <img
                                        src={editForm.image_link}
                                        alt="User"
                                        className="profile-image"
                                    />
                                ) : (
                                    <div className="profile-image-placeholder">
                                        {editForm.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <div className="profile-image-actions">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    Change Image
                                </Button>
                                {(editForm.tempImage ||
                                    editForm.image_link) && (
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={handleDeleteImage}
                                    >
                                        Remove Image
                                    </Button>
                                )}
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleImageUpload(e, "edit")}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    <div className="assets-section">
                        <h5 className="section-title">Assigned Assets</h5>
                        <div className="assets-checkbox-container">
                            {allAssets.length > 0 ? (
                                <div className="asset-checkboxes">
                                    {allAssets.map((asset) => {
                                        const assetId = asset.id;
                                        const isChecked =
                                            editForm.selectedAssets.includes(
                                                assetId
                                            );
                                        return (
                                            <div
                                                key={assetId}
                                                className="asset-checkbox-item"
                                            >
                                                <Form.Check
                                                    type="checkbox"
                                                    id={`edit-asset-${assetId}`}
                                                    checked={isChecked}
                                                    onChange={() =>
                                                        handleEditAssetChange(
                                                            assetId
                                                        )
                                                    }
                                                    label={asset.name}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="no-assets-message">
                                    No assets available to assign
                                </p>
                            )}
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowEditModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleEditConfirm}
                        disabled={!editForm.name || !editForm.role_id}
                    >
                        Save Changes
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Add User Modal - Bootstrap */}
            <Modal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add New User</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={addForm.name}
                            onChange={(e) =>
                                setAddForm({ ...addForm, name: e.target.value })
                            }
                            placeholder="Enter full name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={addForm.email}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    email: e.target.value,
                                })
                            }
                            placeholder="user@example.com"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            value={addForm.role_id}
                            onChange={(e) =>
                                setAddForm({
                                    ...addForm,
                                    role_id: e.target.value,
                                })
                            }
                            required
                        >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.role_id} value={role.role_id}>
                                    {role.role_name}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Assets Section in Add User Form */}
                    <div className="assets-section">
                        <h5 className="section-title">Assign Assets</h5>
                        <div className="assets-checkbox-container">
                            {allAssets.length > 0 ? (
                                <div className="asset-checkboxes">
                                    {allAssets.map((asset) => (
                                        <div
                                            key={asset.id}
                                            className="asset-checkbox-item"
                                        >
                                            <Form.Check
                                                type="checkbox"
                                                id={`asset-${asset.id}`}
                                                checked={addForm.selectedAssets.includes(
                                                    asset.id
                                                )}
                                                onChange={() =>
                                                    handleAddAssetChange(
                                                        asset.id
                                                    )
                                                }
                                                label={asset.name}
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="no-assets-message">
                                    No assets available
                                </p>
                            )}
                        </div>
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Profile Image</Form.Label>
                        <div
                            className="image-drop-zone"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {addForm.image_link ? (
                                <img
                                    src={addForm.image_link}
                                    alt="Preview"
                                    className="preview-image"
                                />
                            ) : (
                                <>
                                    <div className="drop-icon">+</div>
                                    <p>Drop image here</p>
                                    <p>PNG/JPEG, Max 20MB</p>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(e, "add")}
                            accept="image/*"
                            style={{ display: "none" }}
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setShowAddModal(false);
                            setAddForm({
                                name: "",
                                email: "",
                                password: "",
                                role_id: "",
                                image_link: "",
                                selectedAssets: [],
                            });
                        }}
                    >
                        Add another
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowAddModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleAddConfirm}
                        disabled={!addForm.name || !addForm.role_id}
                    >
                        Add User
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default UserList;
