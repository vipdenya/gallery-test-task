import React, { useState, useEffect, useCallback } from "react";
import ImageUploading from "react-images-uploading";
import Gallery from "react-photo-gallery";
import Dexie from "dexie";
import SelectedImage from "./SelectedImage";

import "./App.css";
async function getInitialData(db) {
	let count = await db.gallery.count();
	console.log("count", count);
	let allgallery;
	if (count > 0) {
		allgallery = await db.gallery.toArray();
		return allgallery;
	} else {
		return [];
	}
}
export default function AppImage() {
	const db = new Dexie("DB");
	//create the database store
	db.version(1).stores({
		gallery: "key, src, width, height, file",
	});
	db.open().catch((err) => {
		console.log(err.stack || err);
	});

	const [images, setImages] = useState([]);
	const [gallery, setGallery] = useState([]);
	const [selectAll, setSelectAll] = useState(false);
	const [update, setUpdate] = useState(true);
	const [remove, setRemove] = useState(true);

	const maxNumber = 69;

	const onChange = (imageList, addUpdateIndex) => {
		db.gallery.clear();
		// data for submit
		imageList.map((image, index) => {
			let im = new Image();
			im.src = image.src;
			im.onload = () => {
				image.width = im.width;
				image.height = im.height;
				image.key = Math.random().toString();
				db.gallery.add(image);
			};
		});

		setImages(imageList);
	};
	const imageRenderer = useCallback(
		({ index, left, top, key, photo }) => (
			<SelectedImage
				selected={selectAll ? true : false}
				key={key}
				margin={"2px"}
				index={index}
				photo={photo}
				left={left}
				top={top}
			/>
		),
		[selectAll]
	);
	useEffect(() => {
		async function getDataFromDB() {
			let allgallery = await db.gallery.toArray();
			setGallery(allgallery);

			console.log(allgallery);
		}
		getDataFromDB();
	}, [images]);

	console.log(images, gallery);
	return (
		<div className="AppImage">
			<ImageUploading
				multiple
				value={images}
				onChange={onChange}
				maxNumber={maxNumber}
				dataURLKey="src"
			>
				{({
					imageList,
					onImageUpload,
					onImageRemoveAll,
					onImageUpdate,
					onImageRemove,
					isDragging,
					dragProps,
				}) => (
					// write your building UI
					<div className="upload__image-wrapper">
						<button
							style={isDragging ? { color: "red" } : null}
							onClick={onImageUpload}
							{...dragProps}
						>
							Upload or Drop image here
						</button>
						&nbsp;
						<button onClick={onImageRemoveAll}>Remove all images</button>
						<button disabled={!update}>Update</button>
						<button disabled={!remove}>Remove</button>
						<Gallery
							photos={gallery}
							onClick={(e, obj) => onImageRemove(obj.index)}
							renderImage={imageRenderer}
						/>
						{imageList.map((image, index) => (
							<div key={index} className="image-item">
								<img
									src={image.src}
									alt={image.file.name}
									width={image.width}
								/>
								<div className="image-item__btn-wrapper">
									<button onClick={() => onImageUpdate(index)}>Update</button>
									<button onClick={() => onImageRemove(index)}>Remove</button>
								</div>
							</div>
						))}
					</div>
				)}
			</ImageUploading>
		</div>
	);
}
