package com.medimind.ai;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

@Component
public class DocumentRasterizer {

    private static final Logger log = LoggerFactory.getLogger(DocumentRasterizer.class);
    private static final int MAX_DIMENSION = 2048;
    private static final int PDF_RENDER_DPI = 200;

    /**
     * Converts the first page of a PDF into high-quality JPEG bytes for Vision LLM ingestion.
     */
    public byte[] rasterizePdfFirstPage(byte[] pdfBytes) throws IOException {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            if (document.getNumberOfPages() == 0) {
                throw new IllegalArgumentException("PDF contains zero pages.");
            }
            PDFRenderer renderer = new PDFRenderer(document);
            BufferedImage image = renderer.renderImageWithDPI(0, PDF_RENDER_DPI);
            return optimizeImage(image);
        } catch (Exception e) {
            log.error("Failed to rasterize PDF page: {}", e.getMessage(), e);
            throw new IOException("Failed to process and render PDF image: " + e.getMessage(), e);
        }
    }

    /**
     * Optimizes/resizes raw image bytes to ensure optimal vision API ingestion.
     */
    public byte[] processImageBytes(byte[] imageBytes) throws IOException {
        try (ByteArrayInputStream bais = new ByteArrayInputStream(imageBytes)) {
            BufferedImage image = ImageIO.read(bais);
            if (image == null) {
                // If standard ImageIO fails to decode, return original bytes
                return imageBytes;
            }
            return optimizeImage(image);
        } catch (Exception e) {
            log.warn("Image pre-processing failed, using raw image bytes: {}", e.getMessage());
            return imageBytes;
        }
    }

    private byte[] optimizeImage(BufferedImage originalImage) throws IOException {
        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // Downscale if larger than MAX_DIMENSION
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            double ratio = (double) width / height;
            int newWidth = width;
            int newHeight = height;

            if (width > height) {
                newWidth = MAX_DIMENSION;
                newHeight = (int) (MAX_DIMENSION / ratio);
            } else {
                newHeight = MAX_DIMENSION;
                newWidth = (int) (MAX_DIMENSION * ratio);
            }

            BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = resizedImage.createGraphics();
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            g2d.drawImage(originalImage, 0, 0, newWidth, newHeight, Color.WHITE, null);
            g2d.dispose();
            originalImage = resizedImage;
        } else if (originalImage.getType() != BufferedImage.TYPE_INT_RGB) {
            // Ensure RGB format for clean JPEG output
            BufferedImage rgbImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
            Graphics2D g2d = rgbImage.createGraphics();
            g2d.drawImage(originalImage, 0, 0, Color.WHITE, null);
            g2d.dispose();
            originalImage = rgbImage;
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(originalImage, "JPEG", baos);
        return baos.toByteArray();
    }
}
