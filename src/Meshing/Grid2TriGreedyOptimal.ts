///<reference path="../../node_modules/poly2tri/src/poly2tri.d.ts"/>

import {HopcroftKarp} from "./Utils/HopcroftKarp";
import {Grid2PolyHelper} from "./Utils/Grid2PolyHelper";
import {Iterator} from "../Util/Misc/Iterator"

import * as poly2tri from '../../node_modules/poly2tri/src/poly2tri';

/**
 * Implements an algorithm that optimally covers the surface with rectangles.
 *
 * -> Optimal rectangle coverage
 *
 * Reference: http://arxiv.org/pdf/0908.3916.pdf
 */
class Grid2TriGreedyOptimal {

    // compute the triangulation
    public static triangulate(bits:boolean[][] ):Array<poly2tri.Triangle>  {
        // result list
        let result:Array<poly2tri.Triangle>  = new Array<poly2tri.Triangle>();

        // find some basic parameters
        let lenX:number = bits.length;
        let lenY:number = bits[0].length;

        // get polygons
        let polys:number[][][]  = Grid2PolyHelper.convert(bits);

        // loop over polygons
        for (let poly  of polys) {

            // extract all points in this polygon
            let pointList:Set<poly2tri.Point> = new Set<poly2tri.Point>();
            for (let outline of poly) {
                for (let i:number = 0; i < outline.length; i+=2) {
                    pointList.add(new poly2tri.Point(outline[i], outline[i+1]));
                }
            }

            // find the concave points (vertices)
            let concavePointList:Set<poly2tri.Point> = new Set<poly2tri.Point>(pointList);
            let iterator: Iterator<poly2tri.Point> = new Iterator<poly2tri.Point>(Array.from(concavePointList));
            while(iterator.hasNext()){
                let p:poly2tri.Point = iterator.next();
                // check if concave
                let concave:boolean = (p.x != 0) && (p.y != 0) && (p.x != lenX) && (p.y != lenY) &&
                        (bits[p.x][p.y]?1:0) +
                        (bits[p.x - 1][p.y]?1:0) +
                        (bits[p.x][p.y - 1]?1:0) +
                        (bits[p.x - 1][p.y - 1]?1:0) == 3;
                if (!concave) {
                    iterator.remove();
                }
            }

            // find the "good diagonals"
            let diagonals:Array<poly2tri.Point[]>  = new Array<poly2tri.Point[]>();
            for (let p1 of concavePointList) {
                for (let p2 of concavePointList) {
                    if (p1.x == p2.x && p1.y < p2.y) {
                        // check if they are connected by a line
                        let connected:boolean = true;
                        for (let i:number = Math.min(p1.y, p2.y), len = Math.max(p1.y, p2.y); i < len; i++) {
                            if (!bits[p1.x][i] || !bits[p1.x-1][i]) {
                                connected = false;
                                break;
                            }
                        }
                        if (connected) {
                            diagonals.push(new Array<poly2tri.Point>(p1,p2));
                        }
                    }
                    if (p1.y == p2.y && p1.x < p2.x) {
                        // check if they are connected by a line
                        let connected:boolean = true;
                        for (let i:number = Math.min(p1.x, p2.x), len = Math.max(p1.x, p2.x); i < len; i++) {
                            if (!bits[i][p1.y] || !bits[i][p1.y-1]) {
                                connected = false;
                                break;
                            }
                        }
                        if (connected) {
                            diagonals.push(new Array<poly2tri.Point>(p1,p2));
                        }
                    }
                }
            }

            // compute the bipartite graph mapping
            let mapOtoU:Map<number, Array<number>>  = new Map<number, Array<number>>();
            let mapUtoO:Map<number, Array<number>>  = new Map<number, Array<number>>();
            for (let i1:number = 0; i1 < diagonals.length; i1++) {
                let d1:poly2tri.Point[]  = diagonals[i1];
                let mappedTo:Array<number>  = new Array<number>();
                if (d1[0].x == d1[1].x) {
                    mapOtoU.set(i1, mappedTo);
                } else {
                    mapUtoO.set(i1, mappedTo);
                }
                for (let i2:number = 0; i2 < diagonals.length; i2++) {
                    let d2:poly2tri.Point[]  = diagonals[i2];
                    if (d1 != d2) {
                        if (d1[0].x <= d2[1].x && d1[1].x >= d2[0].x &&
                                d1[0].y <= d2[1].y && d1[1].y >= d2[0].y) {
                            mappedTo.push(i2);
                        }
                    }
                }
            }

//            // -- debug print
//            System.out.println("mapOtoU");
//            for (Map.Entry<Integer, ArrayList<Integer>> entry : mapOtoU.entrySet()) {
//                System.out.print(entry.getKey()+1);
//                System.out.print(" -> ");
//                for (Integer mappedTo : entry.getValue()) {
//                    System.out.print((mappedTo+1) + ", ");
//                }
//                System.out.println();
//            }
//            System.out.println("------");
//
//            // -- debug print
//            System.out.println("mapUtoO");
//            for (Map.Entry<Integer, ArrayList<Integer>> entry : mapUtoO.entrySet()) {
//                System.out.print(entry.getKey()+1);
//                System.out.print(" -> ");
//                for (Integer mappedTo : entry.getValue()) {
//                    System.out.print((mappedTo+1) + ", ");
//                }
//                System.out.println();
//            }
//            System.out.println("------");

            // 1. find a maximum matching with Hopcroft-Karp
            let matching:Map<number, number>  = HopcroftKarp.findMaximumMatching(mapOtoU);
            let revMatching:Map<number, number>  = new Map<number, number>();
            matching.forEach((value: number, key: number) => {
                revMatching.set(value, key);
            });

//            // -- debug
//            System.out.println("Oben");
//            for (Integer key : mapOtoU.keySet()) {
//                System.out.print((key+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");
//
//            // -- debug
//            System.out.println("Unten");
//            for (Integer key : mapUtoO.keySet()) {
//                System.out.print((key+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");
//
//            // -- debug
//            System.out.println("Maximum Matching");
//            for (Map.Entry<Integer, Integer> match : matching.entrySet()) {
//                System.out.println((match.getKey()+1) + " -> " + (match.getValue()+1));
//            }
//            System.out.println("------");

            // ---------

            // compute a maximal independent set using koenigs theorem
            let maxIndependentSet:Set<number>  = computeMaximalIndependetSet(mapOtoU, mapUtoO, matching, revMatching);

//            // -- debug
//            System.out.println("Maximal Independent Set");
//            for (Integer vertex : maxIndependentSet) {
//                System.out.print((vertex+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");

            // -------------

            // extract the point mappings for our edges
            let edgeMapping:Map<poly2tri.Point, poly2tri.Point>  = new Map<poly2tri.Point, poly2tri.Point>();
            for (let vertex of maxIndependentSet) {
                let diag:poly2tri.Point[]  = diagonals[vertex];
                edgeMapping.set(diag[0], diag[1]);
                edgeMapping.set(diag[1], diag[0]);
            }

            // extract point information
            let pointInfoMap:Array<poly2tri.Point[]>  = new Array<poly2tri.Point[]>();
            for (short[] outline : poly) {
                poly2tri.Point prev = new poly2tri.Point(outline[outline.length - 4], outline[outline.length - 3]);
                poly2tri.Point cur = new poly2tri.Point(outline[0], outline[1]);
                for (int i = 2; i < outline.length; i += 2) {
                    poly2tri.Point next = new poly2tri.Point(outline[i], outline[i + 1]);

                    // check if opening or closing point
                    pointInfoMap.add(new poly2tri.Point[] {cur, prev.y < cur.y || next.y > cur.y ? null : cur});

                    prev = cur;
                    cur = next;
                }
            }

            // sort points "by x.y"
            Collections.sort(pointInfoMap, new Comparator<poly2tri.Point[]>() {
                private int sign;
                @Override
                public int compare(poly2tri.Point[] o1, poly2tri.Point[] o2) {
                    sign = (int)Math.signum(o1[0].x - o2[0].x);
                    if (sign != 0) {
                        return sign;
                    } else {
                        return (int) Math.signum(o1[0].y - o2[0].y);
                    }
                }
            });

            // sweepline for rectangle (holds starting position of sweep)
            int[] sweepline = new int[lenY];

            // state information for adding/removing (opening/closing edges)
            Integer adding = null;
            Integer removing = null;

            // number of rectangles in this polygon
            int rectangleCount = 0;

            // loop over ordered points
            for (poly2tri.Point[] points : pointInfoMap) {
                poly2tri.Point p = poly2tri.Points[0];
                // get the other point (if exists)
                poly2tri.Point otherPoint = edgeMapping.get(p);
                // true if this is part of a good edge
                boolean isPartOfGoodEdge = otherPoint != null;
                // true if this is a concave Point
                boolean concavePoint = concavePointList.contains(p);

                // check if this is an "opening point"
                boolean openingPoint = points[1] == null;

                // if this is a concave and (bad point or part of a vertical good line)
                if (concavePoint && (!isPartOfGoodEdge || (otherPoint.x == p.x))) {
                    // check in both directions
                    int add = -1;
                    if (p.y > 0 && sweepline[p.y - 1] != 0) {
                        add = 0;
                    } else if (p.y < lenY && sweepline[p.y] != 0) {
                        add = 1;
                    }
                    if (add != -1) {
                        int val = sweepline[p.y - 1 + add];
                        if (val != 0 && val != p.x + 1) {
                            // find edges and overwrite "depth"
                            int miny = 0;
                            for (int j = p.y - 1 + add; j > -1; j--) {
                                if (sweepline[j] == val) {
                                    sweepline[j] = p.x + 1;
                                } else {
                                    miny = j + 1;
                                    break;
                                }
                            }
                            sweepline[p.y - 1 + add] = val;
                            int maxy = lenY;
                            for (int j = p.y - 1 + add; j < lenY; j++) {
                                if (sweepline[j] == val) {
                                    sweepline[j] = p.x + 1;
                                } else {
                                    maxy = j;
                                    break;
                                }
                            }
//                            System.out.println(miny + " " + maxy + " @1 " + val);
                            result.add(new DelaunayTriangle(new PolygonPoint(val - 1, maxy), new PolygonPoint(val - 1, miny), new PolygonPoint(p.x, miny)));
                            result.add(new DelaunayTriangle(new PolygonPoint(p.x, miny), new PolygonPoint(p.x, maxy), new PolygonPoint(val - 1, maxy)));
                            rectangleCount++;
                        }
                    }
                }


                if (openingPoint) {
                    // update edge in sweepline (adding)
                    if (adding != null) {
                        for (int j = adding; j < p.y; j++) {
                            sweepline[j] = p.x + 1;
                        }
                        adding = null;
                    } else {
                        adding = p.y;
                    }
                } else {
                    // update edge in sweepline (closing)
                    if (removing != null) {
                        int val = sweepline[removing];
                        if (val != 0) {
                            for (int j = removing; j < p.y; j++) {
                                sweepline[j] = 0;
                            }
                            if (val != p.x + 1) {
//                                System.out.println(removing + " " + p.y + " @2 " + val);
                                result.add(new DelaunayTriangle(new PolygonPoint(val - 1, p.y), new PolygonPoint(val - 1, removing), new PolygonPoint(p.x, removing)));
                                result.add(new DelaunayTriangle(new PolygonPoint(p.x, removing), new PolygonPoint(p.x, p.y), new PolygonPoint(val - 1, p.y)));
                                rectangleCount++;
                            }
                        }
                        removing = null;
                    } else {
                        removing = p.y;
                    }
                }

//                // -- debug
//                for (int aSweepline : sweepline) {
//                    //System.out.print(String.format("%02x", aSweepline) + " ");
//                    System.out.print(String.format("%1$-2s", aSweepline));
//                }
//                System.out.println(" @ " + p.x + " " + p.y + " @ " + openingPoint);
            }

            // only do this check computation when running in JDK
            if (App.isDebugMode()) {
                int verticeCount = 0;
                for (short[] outline : poly) {
                    verticeCount += outline.length/2-1;
                }
                assert rectangleCount == verticeCount/2 + poly.length-1 - maxIndependentSet.size() - 1;
            }

//            // sweep over all points
//            for (Integer vertex : maxIndependentSet) {
//                System.out.println(" @ " + (vertex + 1));
//                Point[] diag = diagonals.get(vertex);
//            }

//            //-- debug print
//            for (Point[] p : diagonals) {
//                result.add(new DelaunayTriangle(new PolygonPoint(p[0].x, p[0].y),new PolygonPoint(p[1].x, p[1].y),new PolygonPoint(p[0].x, p[0].y)));
//            }

        }

        return result;
    }

    // compute a maximal independent set using koenig's theorem
    private static computeMaximalIndependetSet(HashMap<Integer, ArrayList<Integer>> mapOtoU, HashMap<Integer, ArrayList<Integer>> mapUtoO,
                                                                HashMap<Integer, Integer> matching, HashMap<Integer, Integer> revMatching):Set<Integer>  {
        // use Koenig's theorem to find vertex cover
        // 2. add all vertices not contained in matching from O to T
        HashSet<Integer> T = new HashSet<Integer>(mapOtoU.keySet());
        T.removeAll(matching.keySet());

//            // -- debug
//            System.out.println("Initial T");
//            for (Integer val : T) {
//                System.out.print((val+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");

        // recently added vertices
        HashSet<Integer> recentlyAdded = new HashSet<Integer>(T);
        HashSet<Integer> recentlyAddedTmp = new HashSet<Integer>();

        // true if we still need to check for more vertices
        boolean verticesAdded;

        // repeat until no more new vertices are found
        do {
            verticesAdded = false;
            // 3. we now move from recently added vertices to vertices in U on all not in maximum matching contained edges
            for (Integer vertex : recentlyAdded) {
                ArrayList<Integer> mapsTo = mapOtoU.get(vertex);
                Integer mapsToInMaxMatching = matching.get(vertex);
                for (Integer target : mapsTo) {
                    // if this matching is not contained in maximum matching
                    if (!target.equals(mapsToInMaxMatching)) {
                        if (T.add(target)) {
                            verticesAdded = true;
                        }
                        T.add(target);
                        recentlyAddedTmp.add(target);
                    }
                }
            }
            recentlyAdded.clear();
            recentlyAdded.addAll(recentlyAddedTmp);
            recentlyAddedTmp.clear();

            // check if we need to continue
            if (!verticesAdded) {
                break;
            }

            verticesAdded = false;
            // 4. we now move from recently added vertices to vertices in O on all in maximum matching contained edges
            for (Integer vertex : recentlyAdded) {
                Integer mapsToInMaxMatching = revMatching.get(vertex);
                if (mapsToInMaxMatching != null) {
                    if (T.add(mapsToInMaxMatching)) {
                        verticesAdded = true;
                    }
                    recentlyAddedTmp.add(mapsToInMaxMatching);
                }
            }
            recentlyAdded.clear();
            recentlyAdded.addAll(recentlyAddedTmp);
            recentlyAddedTmp.clear();

        } while (verticesAdded);

//            // -- debug
//            System.out.println("Final T");
//            for (Integer val : T) {
//                System.out.print((val+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");

        // compute the minimal vertex cover
        HashSet<Integer> minVertexCover = new HashSet<Integer>(mapOtoU.keySet());
        minVertexCover.removeAll(T);
        HashSet<Integer> tmp = new HashSet<Integer>(mapUtoO.keySet());
        tmp.retainAll(T);
        minVertexCover.addAll(tmp);

//            // -- debug
//            System.out.println("Minimal Vertex Cover");
//            for (Integer vertex : minVertexCover) {
//                System.out.print((vertex+1) + ", ");
//            }
//            System.out.println();
//            System.out.println("------");

        // compute the maximal independent set
        HashSet<Integer> maxIndependentSet = new HashSet<Integer>(mapOtoU.keySet());
        maxIndependentSet.addAll(mapUtoO.keySet());
        maxIndependentSet.removeAll(minVertexCover);

        return maxIndependentSet;
    }

}