import argparse
import json
import os
import glob

def main():
    parser = argparse.ArgumentParser(description="Vision Processor")
    parser.add_argument("--backend", required=True, choices=["omniparser", "paddle"], help="Processing backend")
    parser.add_argument("--input_dir", required=True, help="Directory containing extracted frames")
    parser.add_argument("--output", required=True, help="Output directory")
    
    args = parser.parse_args()
    
    print(f"[{args.backend.upper()}] Processing frames in {args.input_dir}...")
    
    frames = sorted(glob.glob(os.path.join(args.input_dir, "*.jpg")))
    
    if not frames:
        print("No frames found to process.")
        return

    results = {
        "input_dir": args.input_dir,
        "backend": args.backend,
        "frames_processed": 0,
        "ui_components": []
    }
    
    # In a real implementation, this would load the models and process frames.
    if args.backend == "omniparser":
        print("Initializing OmniParser on GPU...")
        for frame in frames:
            # Mocking GPU processing
            results["frames_processed"] += 1
            # Mock: only detect on every 5th frame
            if results["frames_processed"] % 5 == 0:
                print(f"Processing {os.path.basename(frame)}...")
                results["ui_components"].append({
                    "frame": os.path.basename(frame),
                    "type": "button", 
                    "text": "Submit", 
                    "confidence": 0.99, 
                    "bbox": [10, 10, 50, 20]
                })
        
    elif args.backend == "paddle":
        print("Initializing PaddleOCR on CPU...")
        for frame in frames:
            # Mocking CPU processing
            results["frames_processed"] += 1
            if results["frames_processed"] % 5 == 0:
                print(f"Processing {os.path.basename(frame)}...")
                results["ui_components"].append({
                    "frame": os.path.basename(frame),
                    "type": "text", 
                    "text": "Hello World", 
                    "confidence": 0.85, 
                    "bbox": [100, 100, 200, 120]
                })

    # Save results
    os.makedirs(args.output, exist_ok=True)
    out_path = os.path.join(args.output, "ui_components.json")
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
        
    print(f"Saved results to {out_path}")

if __name__ == "__main__":
    main()