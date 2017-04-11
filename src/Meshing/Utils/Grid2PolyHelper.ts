/*Adaptation de https://github.com/Driky/voxelshop/blob/develop/src/main/java/com/vitco/app/low/triangulate/util/Grid2PolyHelper.java*/

import {makeInt} from "../../Util/Misc/IntegerTools"

/**
 * Helper class to convert a binary grid into a polygon with holes
 *
 * The method first extracts the edges and then puts them together while determining
 * which hole belongs to which hole.
 *
 * Reference: http://www.lsi.upc.edu/~jmartinez/publications/VPAM12.pdf
 *
 * This particular implementation should be very fast!
 */
export class Grid2PolyHelper{
    // extract edges from an bit array (data)
    // When the method terminates, the vertEdges ArrayList holds the vertical edges sorted in x direction (but not sorted
    // in any y direction) and the edges HashMap, meshes the first coordinate point hash "makeInt" to a short[] array.
    // The short array contains in that order: x1, y1, x2, y2, direction (1 or 0), polygonid (always initialized with -1)
    private static extractEdges(data:boolean[][], vertEdges:Array<number[]> , edges:{[key: number]: number[]} ):void {
        // temporary array to hold current edge
        let edge:number[];

        // prepare dimension variables
        let lenX    :number    = data.length;
        let lenXM   :number    = lenX-1;
        let lenY    :number    = data[0].length;
        let lenYM   :number    = lenY-1;

        // used for edge computation to memorize starting/stop position
        // when traversing the edges
        let start   :number = -1;
        let stop    :number = -1;

        // ==================
        // compute vertical edges

        // find inner vertical edges
        for (let x:number = 1, xM:number = 0; x < lenX; xM = x, x++) {
            for (let y:number = 0; y < lenY; y++) {
                // ---------------
                if ((data[xM][y] || data[xM][y] == data[x][y]) && start != -1) {
                    // add vertex
                    edge = [x,start,x,y,1,-1];
                    edges[-makeInt(edge[0], edge[1])] = edge;
                    vertEdges.push(edge);
                    start = -1;
                }
                if ((data[x][y] || data[xM][y] == data[x][y]) && stop != -1) {
                    // add vertex
                    edge =  [x,y,x,stop,0,-1];
                    edges[makeInt(edge[0], edge[1])] = edge;
                    vertEdges.push(edge);
                    stop = -1;
                }
                if (data[xM][y] !== data[x][y]) { //^replaced with !== no test done
                    if (data[xM][y] && stop == -1) {
                        stop = y;
                    } else if (!data[xM][y] && start == -1) {
                        start = y;
                    }
                }
                // --------------
            }
            // ---------------
            // finish vertical inner edges that start/end at the bottom of the column
            if (start != -1) {
                edge = [x,start,x,lenY,1,-1];
                edges[-makeInt(edge[0], edge[1])] = edge;
                vertEdges.push(edge);
                start = -1;
            }
            if (stop != -1) {
                edge = [x,lenY,x,stop,0,-1];
                edges[makeInt(edge[0], edge[1])] = edge;
                vertEdges.push(edge);
                stop = -1;
            }
            // -------------
        }
    // =============
        // find outside vertical edges
        for (let y:number = 0; y < lenY; y++) {
            if (!data[0][y] && start != -1) {
                // add vertex
                edge = [0,start,0,y,1,-1];
                edges[-makeInt(edge[0], edge[1])] = edge;
                vertEdges.push(edge);
                start = -1;
            }
            if (!data[lenXM][y] && stop != -1) {
                // add vertex
                edge = [lenX,y,lenX,stop,0,-1];
                edges[makeInt(edge[0], edge[1])] = edge;
                vertEdges.push(edge);
                stop = -1;
            }
            if (data[0][y] && start == -1) {
                start = y;
            }
            if (data[lenXM][y] && stop == -1) {
                stop = y;
            }
        }
        // finish vertical outside edges that start/end at the bottom of the two columns
        if (start != -1) {
            edge = [0,start,0,lenY,1,-1];
            edges[-makeInt(edge[0], edge[1])] = edge;
            vertEdges.unshift(edge);
            start = -1;
        }
        if (stop != -1) {
            edge = [lenX, lenY, lenX, stop,0,-1];
            edges[-makeInt(edge[0], edge[1])] = edge;
            vertEdges.push(edge);
            stop = -1;
        }

        // ======================
        // compute horizontal edges

        // find inner horizontal edges
        for (let y:number = 1, yM = 0; y < lenY; yM = y, y++) {
            for (let x:number = 0; x < lenX; x++) {
                // ---------------
                if ((data[x][yM] || data[x][yM] == data[x][y]) && start != -1) {
                    // add vertex
                    edge = [x,y,start,y,0,-1];
                    edges[-makeInt(edge[0], edge[1])] = edge;
                    start = -1;
                }
                if ((data[x][y] || data[x][yM] == data[x][y]) && stop != -1) {
                    // add vertex
                    edge = [stop,y,x,y,1,-1];
                    edges[makeInt(edge[0], edge[1])] = edge;
                    stop = -1;
                }
                if (data[x][yM] !== data[x][y]) {
                    if (data[x][yM] && stop == -1) {
                        stop = x;
                    } else if (!data[x][yM] && start == -1) {
                        start = x;
                    }
                }
                // --------------
            }
            // ---------------
            // finish inner horizontal edges that start/end at the end of the row
            if (start != -1) {
                edge = [lenX,y,start,y,0,-1];
                edges[-makeInt(edge[0], edge[1])] = edge;
                start = -1;
            }
            if (stop != -1) {
                edge = [stop,y,lenX,y,1,-1];
                edges[makeInt(edge[0], edge[1])] = edge;
                stop = -1;
            }
            // -------------
        }

        // =============
        // compute outside horizontal edges

        for (let x:number = 0; x < lenX; x++) {
            if (!data[x][0] && start != -1) {
                // add vertex
                edge = [x,0,start,0,0,-1];
                edges[-makeInt(edge[0], edge[1])] = edge;
                start = -1;
            }
            if (!data[x][lenYM] && stop != -1) {
                // add vertex
                edge = [stop,lenY,x,lenY,1,-1];
                edges[makeInt(edge[0], edge[1])] = edge;
                stop = -1;
            }
            if (data[x][0] && start == -1) {
                start = x;
            }
            if (data[x][lenYM] && stop == -1) {
                stop = x;
            }
        }
        // finish horizontal edges that start/end at the end of the two rows
        if (start != -1) {
            edge = [lenX,0,start,0,0,-1];
            edges[-makeInt(edge[0], edge[1])] = edge;
            //start = -1;
        }
        if (stop != -1) {
            edge = [stop,lenY,lenX,lenY,1,-1];
            edges[makeInt(edge[0], edge[1])] = edge;
            //stop = -1;
        }
    }
}